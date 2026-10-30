// NOTE: This function's name is a legacy holdover. It no longer captures the
// Stripe hold — capture now happens when the mechanic starts the job
// (startOrderAndCapture). This function only verifies the hold exists and
// transitions the order to Scheduled.

import { HttpsError, onCall } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";

interface CaptureDepositAndApproveQuoteRequest {
  orderId: string;
}

export const captureDepositAndApproveQuote = onCall<CaptureDepositAndApproveQuoteRequest>(
  async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Authentication required.");
  }

  const orderId = request.data.orderId;
  if (!orderId || typeof orderId !== "string") {
    throw new HttpsError("invalid-argument", "orderId is required.");
  }

  const db = getFirestore();
  const orderRef = db.collection("repair-orders").doc(orderId);
  const orderSnap = await orderRef.get();

  if (!orderSnap.exists) {
    throw new HttpsError("not-found", "Order not found.");
  }

  const order = orderSnap.data() as {
    customerId: string;
    status: string;
    paymentStatus?: string;
  };

  if (order.customerId !== request.auth.uid) {
    throw new HttpsError("permission-denied", "Only the customer can approve this quote.");
  }

  if (order.status !== "QuoteProposed") {
    throw new HttpsError("failed-precondition", "Quote is not available for approval.");
  }

  if (order.paymentStatus !== "authorized") {
    throw new HttpsError("failed-precondition", "Deposit hold must be authorized before approving.");
  }

  const now = Date.now();
  await orderRef.update({
    status: "Scheduled",
    quoteApprovedAt: now,
    updatedAt: now,
  });

  // eslint-disable-next-line no-console
  console.log(`[captureDepositAndApproveQuote] approved quote for order ${orderId}`);

  return { success: true };
});
