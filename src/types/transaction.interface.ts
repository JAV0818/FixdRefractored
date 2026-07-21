// Cross-cutting transaction types. Modeled on BACKEND_DESIGN.md §2.5
// (transactions). Timestamps are `number` (ms since epoch) to match the rest of
// the codebase.

export type TransactionMethod = "stripe" | "cash";

export type TransactionStatus = "completed" | "failed" | "pending" | "refunded";

export type TransactionType = "deposit" | "final_payment" | "refund";

export type Transaction = {
  amount: number;
  completedAt: number | null;
  createdAt: number;
  customerId: string;
  id: string;
  method: TransactionMethod;
  notes: string | null;
  orderId: string;
  platformFee: number;
  providerEarnings: number;
  providerId: string | null;
  status: TransactionStatus;
  stripeChargeId: string | null;
  stripePaymentIntentId: string | null;
  type: TransactionType;
};
