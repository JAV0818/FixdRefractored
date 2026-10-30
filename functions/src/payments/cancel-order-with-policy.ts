import { HttpsError, onCall } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import Stripe from "stripe";

interface CancelOrderWithPolicyRequest {
  orderId: string;
}

const CANCELLATION_WINDOW_MS = 48 * 60 * 60 * 1000; // 48 hours

export const cancelOrderWithPolicy = onCall<CancelOrderWithPolicyRequest>(
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
    status: string;
    scheduledAt: number;
    stripePaymentIntentId?: string | null;
    paymentStatus?: string;
  };

  if (order.customerId !== request.auth.uid) {
    throw new HttpsError("permission-denied", "Only the customer can cancel this order.");
  }

  if (order.status !== "Scheduled") {
    throw new HttpsError("failed-precondition", "Only scheduled orders can be cancelled.");
  }

  if (!order.stripePaymentIntentId || order.paymentStatus !== "authorized") {
    throw new HttpsError("failed-precondition", "No authorized deposit hold found.");
  }

  if (!order.scheduledAt) {
    throw new HttpsError("failed-precondition", "Order has no scheduled appointment time.");
  }

  const now = Date.now();
  const timeUntilAppointment = order.scheduledAt - now;
  const isFreeCancel = timeUntilAppointment >= CANCELLATION_WINDOW_MS;

  try {
    if (isFreeCancel) {
      await stripe.paymentIntents.cancel(order.stripePaymentIntentId);

      // eslint-disable-next-line no-console
      console.log(`[cancelOrderWithPolicy] released hold ${order.stripePaymentIntentId} (free cancel, ${Math.round(timeUntilAppointment / 3600000)}h before appointment)`);

      await orderRef.update({
        status: "Cancelled",
        paymentStatus: "released",
        depositReleasedAt: now,
        cancellationReason: "customer_cancelled",
        cancelledBy: request.auth.uid,
        cancelledAt: now,
        updatedAt: now,
      });
    } else {
      const paymentIntent = await stripe.paymentIntents.capture(order.stripePaymentIntentId);

      // eslint-disable-next-line no-console
      console.log(`[cancelOrderWithPolicy] captured ${paymentIntent.id} (late cancel, ${Math.round(timeUntilAppointment / 3600000)}h before appointment)`);

      await orderRef.update({
        status: "Cancelled",
        paymentStatus: "deposit_paid",
        depositPaid: true,
        depositCapturedAt: now,
        cancellationReason: "customer_cancelled",
        cancelledBy: request.auth.uid,
        cancelledAt: now,
        updatedAt: now,
      });
    }

    return { success: true, charged: !isFreeCancel };
  } catch (err) {
    console.error("[cancelOrderWithPolicy] Stripe error:", err);
    throw new HttpsError("internal", "Unable to process cancellation. Please try again.");
  }
});
