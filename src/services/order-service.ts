// Order service — the only file that reads/writes the `repair-orders` Firestore
// collection. Hooks call these; views and components never import this directly.

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  runTransaction,
  onSnapshot,
  increment,
  writeBatch,
  type QueryConstraint,
  type Unsubscribe,
} from "firebase/firestore";

import { db } from "./firebase";
import type {
  RepairOrder,
  CreateCustomQuoteInput,
  CreateOrderInput,
  OrderItem,
  OrderStatus,
  CancellationReason,
} from "@/types/order.interface";

const ORDERS = "repair-orders";

// The $20 deposit IS the flat platform fee (BACKEND_DESIGN.md §5.3).
export const PLATFORM_DEPOSIT = 20;

// Mechanic-claim window: a Pending order auto-expires 24h after creation if no
// mechanic accepts it (BACKEND_DESIGN.md "Revised order & payment lifecycle").
export const ORDER_EXPIRY_MS = 24 * 60 * 60 * 1000;

// Quote-approval window: once a mechanic proposes a quote, the customer has 2
// days to approve before the order expires and the $20 hold is released.
export const QUOTE_APPROVAL_WINDOW_MS = 2 * 24 * 60 * 60 * 1000;

// Safety cap on the unbounded list queries (marketplace + provider history) so a
// large dataset can't blow up Firestore read cost. Not real pagination — see the
// TODO on getAvailableOrders for the cursor-based follow-up.
const LIST_QUERY_LIMIT = 50;

const ordersCollection = () => collection(db, ORDERS);

const snapToOrder = (snap: { id: string; data: () => Record<string, unknown> }): RepairOrder =>
  ({ id: snap.id, ...snap.data() }) as RepairOrder;

export const orderService = {
  // Customer creates a standard request. Mechanic prices it later (M5).
  async createOrder(input: CreateOrderInput): Promise<string> {
    const now = Date.now();
    const order: Omit<RepairOrder, "id"> = {
      orderType: "standard",
      status: "Pending",

      customerId: input.customerId,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      providerId: null,
      providerName: null,
      assignedBy: null,

      description: input.description,
      categories: input.categories,
      vehicleInfo: input.vehicleInfo,
      locationDetails: input.locationDetails,

      estimatedTotal: input.estimatedTotal ?? 0,
      items: [],
      laborCost: 0,
      partsCost: 0,
      totalPrice: 0,
      depositAmount: PLATFORM_DEPOSIT,
      depositPaid: false,
      remainingBalance: 0,

      mediaUrls: input.mediaUrls,

      createdAt: now,
      updatedAt: now,
      expiresAt: now + ORDER_EXPIRY_MS,
      acceptedAt: null,
      quoteProposedAt: null,
      quoteExpiresAt: null,
      quoteApprovedAt: null,
      scheduledAt: input.scheduledAt, // customer's preferred time (mechanic may adjust)
      startedAt: null,
      inspectionCompletedAt: null,
      completedAt: null,
      cancelledAt: null,

      cancellationReason: null,
      cancelledBy: null,

      paymentMethod: null,
      paymentStatus: "pending",
      stripePaymentIntentId: null,
      depositAuthorizedAt: null,
      depositCapturedAt: null,
      depositReleasedAt: null,
      depositRefundedAt: null,

      customerRating: null,
      customerReview: null,
      ratedAt: null,
      ratingOfCustomer: null,
      reviewOfCustomer: null,
      customerRatedAt: null,
    };

    const ref = await addDoc(ordersCollection(), order);
    return ref.id;
  },

  // Mechanic creates a custom quote for a specific customer (mechanic-initiated
  // flow). The order skips Pending/Accepted and lands directly at QuoteProposed
  // so the customer can immediately approve or decline.
  async createCustomQuote(input: CreateCustomQuoteInput): Promise<string> {
    const now = Date.now();
    const order: Omit<RepairOrder, "id"> = {
      orderType: "custom_quote",
      status: "QuoteProposed",

      customerId: input.customerId,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      providerId: input.providerId,
      providerName: input.providerName,
      assignedBy: null,

      description: input.description,
      categories: input.categories,
      vehicleInfo: input.vehicleInfo,
      locationDetails: { address: "", city: null, state: null, zip: null },

      estimatedTotal: input.totalPrice,
      items: input.items,
      laborCost: 0,
      partsCost: 0,
      totalPrice: input.totalPrice,
      depositAmount: PLATFORM_DEPOSIT,
      depositPaid: false,
      remainingBalance: Math.max(input.totalPrice - PLATFORM_DEPOSIT, 0),

      mediaUrls: [],

      createdAt: now,
      updatedAt: now,
      // Custom quotes don't need a mechanic-claim window; use the approval window
      // as the effective deadline for both fields.
      expiresAt: now + QUOTE_APPROVAL_WINDOW_MS,
      acceptedAt: now,
      quoteProposedAt: now,
      quoteExpiresAt: now + QUOTE_APPROVAL_WINDOW_MS,
      quoteApprovedAt: null,
      scheduledAt: input.scheduledAt,
      startedAt: null,
      inspectionCompletedAt: null,
      completedAt: null,
      cancelledAt: null,

      cancellationReason: null,
      cancelledBy: null,

      paymentMethod: null,
      paymentStatus: "pending",
      stripePaymentIntentId: null,
      depositAuthorizedAt: null,
      depositCapturedAt: null,
      depositReleasedAt: null,
      depositRefundedAt: null,

      customerRating: null,
      customerReview: null,
      ratedAt: null,
      ratingOfCustomer: null,
      reviewOfCustomer: null,
      customerRatedAt: null,
    };

    const ref = await addDoc(ordersCollection(), order);
    return ref.id;
  },

  async getOrderById(id: string): Promise<RepairOrder | undefined> {
    const snap = await getDoc(doc(db, ORDERS, id));
    if (!snap.exists()) return undefined;
    return snapToOrder(snap);
  },

  // Real-time: stream a single order. Returns an unsubscribe fn the caller must
  // call on cleanup. Hooks use this for live status (e.g. customer waiting on a
  // quote); the only place onSnapshot for `repair-orders` lives.
  subscribeToOrder(
    id: string,
    onData: (order: RepairOrder | undefined) => void,
    onError: (error: Error) => void,
  ): Unsubscribe {
    return onSnapshot(
      doc(db, ORDERS, id),
      (snap) => onData(snap.exists() ? snapToOrder(snap) : undefined),
      onError,
    );
  },

  // Real-time: stream a customer's orders, newest first. Same composite index as
  // getOrdersByCustomer.
  subscribeToCustomerOrders(
    customerId: string,
    onData: (orders: RepairOrder[]) => void,
    onError: (error: Error) => void,
  ): Unsubscribe {
    const q = query(
      ordersCollection(),
      where("customerId", "==", customerId),
      orderBy("createdAt", "desc"),
      limit(LIST_QUERY_LIMIT),
    );
    return onSnapshot(q, (snap) => onData(snap.docs.map(snapToOrder)), onError);
  },

  // Real-time: stream the marketplace pool so a newly created order shows up
  // without a reload. Same query + client-side expiry filter as
  // getAvailableOrders (see its TODO on the M10 expire function).
  subscribeToAvailableOrders(
    onData: (orders: RepairOrder[]) => void,
    onError: (error: Error) => void,
  ): Unsubscribe {
    const q = query(
      ordersCollection(),
      where("providerId", "==", null),
      where("status", "==", "Pending"),
      orderBy("createdAt", "desc"),
      limit(LIST_QUERY_LIMIT),
    );
    return onSnapshot(
      q,
      (snap) => {
        const now = Date.now();
        onData(snap.docs.map(snapToOrder).filter((o) => o.expiresAt > now));
      },
      onError,
    );
  },

  // Real-time: stream the orders a mechanic has accepted/been assigned, newest
  // first, so the Queue reflects new jobs and status changes without a reload.
  // Same composite index as getOrdersByProvider.
  subscribeToProviderOrders(
    providerId: string,
    onData: (orders: RepairOrder[]) => void,
    onError: (error: Error) => void,
  ): Unsubscribe {
    const q = query(
      ordersCollection(),
      where("providerId", "==", providerId),
      orderBy("createdAt", "desc"),
      limit(LIST_QUERY_LIMIT),
    );
    return onSnapshot(q, (snap) => onData(snap.docs.map(snapToOrder)), onError);
  },

  // A customer's own orders, newest first.
  async getOrdersByCustomer(customerId: string): Promise<RepairOrder[]> {
    const q = query(
      ordersCollection(),
      where("customerId", "==", customerId),
      orderBy("createdAt", "desc"),
    );
    const snap = await getDocs(q);
    return snap.docs.map(snapToOrder);
  },

  // Orders a mechanic has accepted/been assigned, newest first.
  async getOrdersByProvider(providerId: string): Promise<RepairOrder[]> {
    const q = query(
      ordersCollection(),
      where("providerId", "==", providerId),
      orderBy("createdAt", "desc"),
      limit(LIST_QUERY_LIMIT),
    );
    const snap = await getDocs(q);
    return snap.docs.map(snapToOrder);
  },

  // Owner/admin: every order, optionally filtered by status. No client-side
  // limit so the admin sees the full list; pagination can be added once volume
  // justifies it.
  async getAllOrders(filters?: { status?: OrderStatus }): Promise<RepairOrder[]> {
    const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];
    if (filters?.status) {
      constraints.unshift(where("status", "==", filters.status));
    }
    const q = query(ordersCollection(), ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map(snapToOrder);
  },

  // Owner/admin: live stream of every order, optionally filtered by status.
  subscribeToAllOrders(
    onData: (orders: RepairOrder[]) => void,
    onError: (error: Error) => void,
    filters?: { status?: OrderStatus },
  ): Unsubscribe {
    const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];
    if (filters?.status) {
      constraints.unshift(where("status", "==", filters.status));
    }
    const q = query(ordersCollection(), ...constraints);
    return onSnapshot(
      q,
      (snap) => onData(snap.docs.map(snapToOrder)),
      onError,
    );
  },

  // Owner/admin assigns a mechanic to an order. Atomically updates provider
  // details, the assigning owner, and bumps Pending → Accepted. The provider
  // name is read from the users doc inside the transaction so the caller only
  // needs the provider id.
  async assignOrderToProvider(
    orderId: string,
    providerId: string,
    assignedBy: string,
  ): Promise<void> {
    const orderRef = doc(db, ORDERS, orderId);
    const providerRef = doc(db, "users", providerId);
    await runTransaction(db, async (tx) => {
      const orderSnap = await tx.get(orderRef);
      const providerSnap = await tx.get(providerRef);
      if (!orderSnap.exists()) throw new Error("Order not found");
      if (!providerSnap.exists()) throw new Error("Provider not found");

      const orderData = orderSnap.data();
      const providerData = providerSnap.data();
      const now = Date.now();
      const firstName = (providerData.firstName as string | null) ?? "";
      const lastName = (providerData.lastName as string | null) ?? "";
      const providerName = `${firstName} ${lastName}`.trim() || (providerData.email as string) || providerId;

      const update: Partial<RepairOrder> = {
        providerId,
        providerName,
        assignedBy,
        updatedAt: now,
      };
      if (orderData.status === "Pending") {
        update.status = "Accepted";
        update.acceptedAt = now;
      }
      tx.update(orderRef, update);
    });
  },

  // The marketplace feed: unassigned, still-pending orders (M5).
  // Expiry is filtered client-side until the M10 expire function flips status.
  // TODO(pagination): switch to cursor-based paging (useInfiniteQuery +
  // startAfter(lastDoc)) once volume grows. Requires the M10 expire function to
  // flip status server-side first, so paged results don't fill with expired
  // orders that the client-side filter would silently drop.
  async getAvailableOrders(): Promise<RepairOrder[]> {
    const q = query(
      ordersCollection(),
      where("providerId", "==", null),
      where("status", "==", "Pending"),
      orderBy("createdAt", "desc"),
      limit(LIST_QUERY_LIMIT),
    );
    const snap = await getDocs(q);
    const now = Date.now();
    return snap.docs.map(snapToOrder).filter((o) => o.expiresAt > now);
  },

  // Mechanic submits the priced quote → opens the customer's approval window.
  // The $20 hold stays authorized (uncaptured) until the customer approves.
  async proposeQuote(
    id: string,
    quote: {
      items: OrderItem[];
      laborCost: number;
      partsCost: number;
      totalPrice: number;
      scheduledAt: number; // mechanic confirms/adjusts the customer's requested time
    },
  ): Promise<void> {
    const now = Date.now();
    await updateDoc(doc(db, ORDERS, id), {
      status: "QuoteProposed",
      items: quote.items,
      laborCost: quote.laborCost,
      partsCost: quote.partsCost,
      totalPrice: quote.totalPrice,
      remainingBalance: Math.max(quote.totalPrice - PLATFORM_DEPOSIT, 0),
      scheduledAt: quote.scheduledAt,
      quoteProposedAt: now,
      quoteExpiresAt: now + QUOTE_APPROVAL_WINDOW_MS,
      updatedAt: now,
    });
  },

  // Customer approves and books an appointment (which may be far in the future).
  // Customer successfully confirmed the card in the Stripe PaymentSheet.
  // Mark the deposit hold as authorized on the order.
  async markDepositAuthorized(id: string): Promise<void> {
    await updateDoc(doc(db, ORDERS, id), {
      paymentStatus: "authorized",
      depositAuthorizedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },

  // Capturing the $20 hold is done server-side by the payment Cloud Function,
  // which then sets paymentStatus → "deposit_paid" + depositCapturedAt.
  // The appointment time was set by the customer at request and confirmed by the
  // mechanic in the quote, so approval just books it — no time argument.
  async approveQuote(id: string): Promise<void> {
    const now = Date.now();
    await updateDoc(doc(db, ORDERS, id), {
      status: "Scheduled",
      quoteApprovedAt: now,
      updatedAt: now,
    });
  },

  // Customer declines the quote → order cancelled. Releasing the hold (so they
  // are never charged) is done server-side by the payment Cloud Function.
  async declineQuote(id: string, cancelledBy: string): Promise<void> {
    const now = Date.now();
    await updateDoc(doc(db, ORDERS, id), {
      status: "Cancelled",
      cancellationReason: "quote_declined",
      cancelledBy,
      cancelledAt: now,
      updatedAt: now,
    });
  },

  // System (scheduled Cloud Function): the approval window lapsed with no
  // response → expire the order; the payment function releases the hold.
  async expireQuoteWindow(id: string): Promise<void> {
    await updateDoc(doc(db, ORDERS, id), {
      status: "Expired",
      cancellationReason: "quote_expired",
      updatedAt: Date.now(),
    });
  },

  // Advance the lifecycle. `extra` carries the matching timestamp/fields
  // (e.g. { acceptedAt }, { scheduledAt }, { cancelledAt, cancellationReason }).
  async updateOrderStatus(
    id: string,
    status: OrderStatus,
    extra: Partial<RepairOrder> = {},
  ): Promise<void> {
    await updateDoc(doc(db, ORDERS, id), {
      status,
      updatedAt: Date.now(),
      ...extra,
    });
  },

  // Assign a mechanic to an order (M5 accept / M8 owner assign).
  async updateOrderProvider(id: string, providerId: string, providerName: string): Promise<void> {
    await updateDoc(doc(db, ORDERS, id), {
      providerId,
      providerName,
      updatedAt: Date.now(),
    });
  },

  // Mechanic claims a Pending order → Accepted. They build the quote next.
  // Runs in a transaction so two mechanics can't claim the same order: the
  // re-read inside the transaction rejects the claim if another mechanic already
  // took it (status moved off Pending, or providerId is set). Throws on conflict
  // so the caller can surface "no longer available".
  async acceptOrder(id: string, providerId: string, providerName: string): Promise<void> {
    const ref = doc(db, ORDERS, id);
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists()) throw new Error("Order not found");

      const data = snap.data();
      const now = Date.now();
      if (data.status !== "Pending" || data.providerId != null) {
        throw new Error("This order has already been claimed by another mechanic.");
      }
      // Defense-in-depth: don't let a stale Pending order be claimed past its 24h
      // window (the M10 expire function isn't live yet to flip status server-side).
      if (now > data.expiresAt) {
        throw new Error("This order has expired and is no longer available.");
      }

      tx.update(ref, {
        providerId,
        providerName,
        status: "Accepted",
        acceptedAt: now,
        updatedAt: now,
      });
    });
  },

  // Mechanic starts a Scheduled job → InProgress. (Inspection order-forms are
  // created by the M5 inspection-checklist screen, not here.)
  async startOrder(id: string): Promise<void> {
    const now = Date.now();
    await updateDoc(doc(db, ORDERS, id), {
      status: "InProgress",
      startedAt: now,
      updatedAt: now,
    });
  },

  // Cancel an order. `cancelledBy` is the actor's uid; `reason` distinguishes
  // who/why (e.g. "mechanic_cancelled", "customer_cancelled").
  async cancelOrder(id: string, cancelledBy: string, reason: CancellationReason): Promise<void> {
    const now = Date.now();
    await updateDoc(doc(db, ORDERS, id), {
      status: "Cancelled",
      cancellationReason: reason,
      cancelledBy,
      cancelledAt: now,
      updatedAt: now,
    });
  },

  // Mechanic adds extra charges that came up during the job. Runs in a
  // transaction so the running total is always consistent: reads the current
  // items list, appends the new ones, and rewrites totalPrice + remainingBalance
  // atomically. Only valid on InProgress orders.
  async addCustomCharges(id: string, newItems: OrderItem[]): Promise<void> {
    const ref = doc(db, ORDERS, id);
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists()) throw new Error("Order not found");
      const data = snap.data() as RepairOrder;
      if (data.status !== "InProgress")
        throw new Error("Charges can only be added to an in-progress order.");
      const updatedItems: OrderItem[] = [...data.items, ...newItems];
      const earnings = updatedItems.reduce((sum, it) => sum + it.price * it.quantity, 0);
      const totalPrice = earnings + PLATFORM_DEPOSIT;
      tx.update(ref, {
        items: updatedItems,
        totalPrice,
        remainingBalance: Math.max(totalPrice - PLATFORM_DEPOSIT, 0),
        updatedAt: Date.now(),
      });
    });
  },

  // Mechanic finishes the job → Completed. Bumps the mechanic's lifetime job
  // count atomically in the same batch. (Rating averages are recalculated by a
  // Cloud Function, not here — see slice 2 / M10.)
  async completeOrder(id: string, providerId: string): Promise<void> {
    const now = Date.now();
    const batch = writeBatch(db);
    batch.update(doc(db, ORDERS, id), { status: "Completed", completedAt: now, updatedAt: now });
    batch.update(doc(db, "users", providerId), {
      "providerProfile.totalJobsCompleted": increment(1),
    });
    await batch.commit();
  },
};
