// Cross-cutting order types. Modeled on BACKEND_DESIGN.md §2.2 (repair-orders),
// trimmed to what M3–M5 need. Timestamps are `number` (ms since epoch) to match
// the rest of the codebase (see user.interface.ts), not Firestore Timestamps.

// The order lifecycle state machine (see BACKEND_DESIGN.md "Revised order &
// payment lifecycle"). Three independent clocks:
//   • mechanic-claim window  — Pending auto-expires after 24h with no mechanic
//   • quote-approval window  — QuoteProposed auto-expires after ~2 days ($20 hold)
//   • scheduling lead time   — open-ended; the appointment can be far in the future
//
//   Pending → Accepted → QuoteProposed → Scheduled → InProgress → Completed
//   Pending        → Expired   (no mechanic in 24h)
//   QuoteProposed  → Expired   (approval window lapses)  | Cancelled (declined)
//   Pending/Accepted/Scheduled/InProgress → Cancelled
export type OrderStatus =
  | "Pending"
  | "Accepted"
  | "QuoteProposed"
  | "Scheduled"
  | "InProgress"
  | "Completed"
  | "Expired"
  | "Cancelled";

// "standard" = customer request awaiting a mechanic. "custom_quote" = mechanic-priced job.
export type OrderType = "standard" | "custom_quote";

export type PaymentMethod = "stripe" | "cash";

// The $20 deposit is a Stripe manual-capture (authorization) hold:
//   pending    → authorized   (hold placed at checkout, funds not moved)
//   authorized → deposit_paid (captured when the customer approves the quote)
//   authorized → released     (hold cancelled on decline/expiry — never charged)
//   deposit_paid → refunded   (captured then returned — rare fallback)
//   …          → paid         (full job balance settled after completion)
export type PaymentStatus =
  | "pending"
  | "authorized"
  | "deposit_paid"
  | "paid"
  | "released"
  | "refunded";

// Why an order ended up Cancelled or Expired — drives the UX message + analytics.
export type CancellationReason =
  | "quote_declined"
  | "quote_expired"
  | "expired_no_mechanic"
  | "customer_cancelled"
  | "mechanic_cancelled"
  | "admin_cancelled";

// A priced line item (populated when a mechanic builds a quote — M5).
export type OrderItem = {
  description: string | null;
  name: string;
  price: number;
  quantity: number;
};

export type LocationDetails = {
  address: string;
  city: string | null;
  state: string | null;
  zip: string | null;
};

export type RepairOrder = {
  // Identity
  id: string;
  orderType: OrderType;
  status: OrderStatus;

  // Parties (names denormalized for fast list rendering)
  assignedBy: string | null; // owner id if manually assigned (M8)
  customerId: string;
  customerName: string;
  customerPhone: string | null;
  providerId: string | null;
  providerName: string | null;

  // Service details
  categories: string[];
  description: string;
  locationDetails: LocationDetails;
  vehicleInfo: string;

  // Pricing. `estimatedTotal` is the catalog estimate shown to the customer at
  // checkout; `totalPrice` is the mechanic's confirmed quote. The $20 deposit is
  // the flat platform fee.
  depositAmount: number; // always PLATFORM_DEPOSIT (20)
  depositPaid: boolean;
  estimatedTotal: number;
  items: OrderItem[];
  laborCost: number;
  partsCost: number;
  remainingBalance: number; // totalPrice - depositAmount
  totalPrice: number;

  // Customer-uploaded photos (Firebase Storage download URLs)
  mediaUrls: string[];

  // Lifecycle timestamps (ms since epoch)
  acceptedAt: number | null;
  cancelledAt: number | null;
  completedAt: number | null;
  createdAt: number;
  expiresAt: number; // mechanic-claim deadline: Pending auto-expires at this time
  quoteApprovedAt: number | null;
  quoteExpiresAt: number | null; // approval deadline, once a quote is proposed
  quoteProposedAt: number | null;
  scheduledAt: number | null;
  startedAt: number | null;
  updatedAt: number;

  // Cancellation
  cancellationReason: CancellationReason | null;
  cancelledBy: string | null;

  // Payment — $20 deposit via a Stripe manual-capture hold (M9).
  depositAuthorizedAt: number | null;
  depositCapturedAt: number | null;
  depositRefundedAt: number | null;
  depositReleasedAt: number | null;
  paymentMethod: PaymentMethod | null;
  paymentStatus: PaymentStatus;
  stripePaymentIntentId: string | null;

  // Rating — customer → mechanic (M4)
  customerRating: number | null;
  customerReview: string | null;
  ratedAt: number | null;

  // Rating — mechanic → customer (feeds the customer profile's averageRating)
  customerRatedAt: number | null;
  ratingOfCustomer: number | null;
  reviewOfCustomer: string | null;
};

// What the customer supplies when creating a request. The service fills in
// status, timestamps, pricing defaults, and the rest.
export type CreateOrderInput = {
  categories: string[];
  customerId: string;
  customerName: string;
  customerPhone: string | null;
  description: string;
  // Catalog estimate at checkout. 0 for free-form "describe the issue" requests,
  // where there's no upfront estimate.
  estimatedTotal?: number;
  locationDetails: LocationDetails;
  mediaUrls: string[];
  vehicleInfo: string;
};
