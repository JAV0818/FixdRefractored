import { HttpsError, onCall } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import Stripe from "stripe";

interface CaptureDepositAndApproveQuoteRequest {
  orderId: string;
}

export const captureDepositAndApproveQuote = onCall<CaptureDepositAndApproveQuoteRequest>(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Authentication required.");
  }

  const orderId = request.data.orderId;
  if (!orderId || typeof orderId !== "string") {
    throw new HttpsError("invalid-argument", "orderId is required.");
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new HttpsError("failed-precondition", "Stripe secret key is not configured.");
  }

  const stripe = new Stripe(secretKey, { apiVersion: "2026-06-24.dahlia" });
  const db = getFirestore();
  const orderRef = db.collection("repair-orders").doc(orderId);
  const orderSnap = await orderRef.get();

  if (!orderSnap.exists) {
    throw new HttpsError("not-found", "Order not found.");
  }

  const order = orderSnap.data() as {
    customerId: string;
    status: string;
    stripePaymentIntentId?: string | null;
    paymentStatus?: string;
  };

  if (order.customerId !== request.auth.uid) {
    throw new HttpsError("permission-denied", "Only the customer can approve this quote.");
  }

  if (order.status !== "QuoteProposed") {
    throw new HttpsError("failed-precondition", "Quote is not available for approval.");
  }

  if (!order.stripePaymentIntentId) {
    throw new HttpsError("failed-precondition", "No deposit authorization found.");
  }

  try {
    const paymentIntent = await stripe.paymentIntents.capture(order.stripePaymentIntentId);

    // eslint-disable-next-line no-console
    console.log(`[captureDepositAndApproveQuote] captured ${paymentIntent.id} for order ${orderId}`);

    const now = Date.now();
    await orderRef.update({
      status: "Scheduled",
      paymentStatus: "deposit_paid",
      depositCapturedAt: now,
      quoteApprovedAt: now,
      updatedAt: now,
    });

    return { success: true };
  } catch (err) {
    console.error("[captureDepositAndApproveQuote] Stripe error:", err);
    throw new HttpsError("internal", "Unable to capture deposit.");
  }
});
