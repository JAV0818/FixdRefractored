// Cross-cutting order types. Modeled on BACKEND_DESIGN.md §2.2 (repair-orders),
// trimmed to what M3–M5 need. Timestamps are `number` (ms since epoch) to match
// the rest of the codebase (see user.interface.ts), not Firestore Timestamps.

// The order lifecycle state machine (BACKEND_DESIGN.md §3):
//   Pending → Accepted → Scheduled → InProgress → Completed
//   Pending → Expired (24h)  |  Pending/Accepted/InProgress → Cancelled
export type OrderStatus =
  | "Pending"
  | "Accepted"
  | "Scheduled"
  | "InProgress"
  | "Completed"
  | "Expired"
  | "Cancelled";

// "standard" = customer request awaiting a mechanic. "custom_quote" = mechanic-priced job.
export type OrderType = "standard" | "custom_quote";

export type PaymentMethod = "stripe" | "cash";

export type PaymentStatus = "pending" | "deposit_paid" | "paid" | "refunded";

// A priced line item (populated when a mechanic builds a quote — M5).
export type OrderItem = {
  name: string;
  description: string | null;
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
  id: string;
  orderType: OrderType;
  status: OrderStatus;

  // Parties (names denormalized for fast list rendering)
  customerId: string;
  customerName: string;
  customerPhone: string | null;
  providerId: string | null;
  providerName: string | null;
  assignedBy: string | null; // owner id if manually assigned (M8)

  // Service details
  description: string;
  categories: string[];
  vehicleInfo: string;
  locationDetails: LocationDetails;

  // Pricing — set by the mechanic at quote time; $20 deposit is the flat platform fee.
  items: OrderItem[];
  laborCost: number;
  partsCost: number;
  totalPrice: number;
  depositAmount: number; // always PLATFORM_DEPOSIT (20)
  depositPaid: boolean;
  remainingBalance: number; // totalPrice - depositAmount

  // Customer-uploaded photos (Firebase Storage download URLs)
  mediaUrls: string[];

  // Lifecycle timestamps (ms since epoch)
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
  scheduledAt: number | null;
  acceptedAt: number | null;
  startedAt: number | null;
  completedAt: number | null;
  cancelledAt: number | null;

  // Cancellation
  cancellationReason: string | null;
  cancelledBy: string | null;

  // Payment (M9)
  paymentMethod: PaymentMethod | null;
  paymentStatus: PaymentStatus;
  stripePaymentIntentId: string | null;

  // Rating (after completion — M4)
  customerRating: number | null;
  customerReview: string | null;
  ratedAt: number | null;
};

// What the customer supplies when creating a request. The service fills in
// status, timestamps, pricing defaults, and the rest.
export type CreateOrderInput = {
  customerId: string;
  customerName: string;
  customerPhone: string | null;
  description: string;
  categories: string[];
  vehicleInfo: string;
  locationDetails: LocationDetails;
  mediaUrls: string[];
};
