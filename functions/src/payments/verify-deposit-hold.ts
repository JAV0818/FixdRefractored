import { HttpsError, onCall } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import Stripe from "stripe";

interface VerifyDepositHoldRequest {
  orderId: string;
}

export const verifyDepositHold = onCall<VerifyDepositHoldRequest>(
  { secrets: ["STRIPE_SECRET_KEY"] },
  async (request) => {
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
    stripePaymentIntentId?: string | null;
    paymentStatus?: string;
  };

  if (order.customerId !== request.auth.uid) {
    throw new HttpsError("permission-denied", "Only the customer can verify this deposit.");
  }

  // Already verified — idempotent.
  if (order.paymentStatus === "authorized") {
    return { success: true };
  }

  if (!order.stripePaymentIntentId) {
    throw new HttpsError("failed-precondition", "No payment intent found on this order.");
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);

    if (paymentIntent.status !== "requires_capture") {
      throw new HttpsError(
        "failed-precondition",
        `Payment hold is not authorized. Current status: ${paymentIntent.status}`,
      );
    }

    const now = Date.now();
    await orderRef.update({
      paymentStatus: "authorized",
      depositAuthorizedAt: now,
      updatedAt: now,
    });

    // eslint-disable-next-line no-console
    console.log(`[verifyDepositHold] verified hold ${order.stripePaymentIntentId} for order ${orderId}`);

    return { success: true };
  } catch (err) {
    if (err instanceof HttpsError) throw err;
    console.error("[verifyDepositHold] Stripe error:", err);
    throw new HttpsError("internal", "Unable to verify deposit hold.");
  }
});
