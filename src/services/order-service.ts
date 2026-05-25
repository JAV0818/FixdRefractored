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
  updateDoc,
} from "firebase/firestore";

import { db } from "./firebase";
import type {
  RepairOrder,
  CreateOrderInput,
  OrderStatus,
} from "@/types/order.interface";

const ORDERS = "repair-orders";

// The $20 deposit IS the flat platform fee (BACKEND_DESIGN.md §5.3).
export const PLATFORM_DEPOSIT = 20;

// Pending orders auto-expire 24h after creation (BACKEND_DESIGN.md §3).
export const ORDER_EXPIRY_MS = 24 * 60 * 60 * 1000;

const ordersCollection = () => collection(db, ORDERS);

const snapToOrder = (snap: {
  id: string;
  data: () => Record<string, unknown>;
}): RepairOrder => ({ id: snap.id, ...snap.data() } as RepairOrder);

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
      scheduledAt: null,
      acceptedAt: null,
      startedAt: null,
      completedAt: null,
      cancelledAt: null,

      cancellationReason: null,
      cancelledBy: null,

      paymentMethod: null,
      paymentStatus: "pending",
      stripePaymentIntentId: null,

      customerRating: null,
      customerReview: null,
      ratedAt: null,
    };

    const ref = await addDoc(ordersCollection(), order);
    return ref.id;
  },

  async getOrderById(id: string): Promise<RepairOrder | undefined> {
    const snap = await getDoc(doc(db, ORDERS, id));
    if (!snap.exists()) return undefined;
    return snapToOrder(snap);
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
    );
    const snap = await getDocs(q);
    return snap.docs.map(snapToOrder);
  },

  // The marketplace feed: unassigned, still-pending orders (M5).
  // Expiry is filtered client-side until the M10 expire function flips status.
  async getAvailableOrders(): Promise<RepairOrder[]> {
    const q = query(
      ordersCollection(),
      where("providerId", "==", null),
      where("status", "==", "Pending"),
      orderBy("createdAt", "desc"),
    );
    const snap = await getDocs(q);
    const now = Date.now();
    return snap.docs.map(snapToOrder).filter((o) => o.expiresAt > now);
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
  async updateOrderProvider(
    id: string,
    providerId: string,
    providerName: string,
  ): Promise<void> {
    await updateDoc(doc(db, ORDERS, id), {
      providerId,
      providerName,
      updatedAt: Date.now(),
    });
  },
};
