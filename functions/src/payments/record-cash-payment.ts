import { HttpsError, onCall } from "firebase-functions/v2/https";

interface RecordCashPaymentRequest {
  amount: number;
  orderId: string;
}

// Stub implementation for M9. Validates auth + args and returns a mock success
// payload. Does NOT call the real Stripe API or write to Firestore (M10).
export const recordCashPayment = onCall<RecordCashPaymentRequest>((request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Authentication required.");
  }

  const { orderId, amount } = request.data;
  if (!orderId || typeof orderId !== "string") {
    throw new HttpsError("invalid-argument", "orderId is required.");
  }
  if (typeof amount !== "number" || amount <= 0) {
    throw new HttpsError("invalid-argument", "amount must be a positive number.");
  }

  return { success: true };
});
