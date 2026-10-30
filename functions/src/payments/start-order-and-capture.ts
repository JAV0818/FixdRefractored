import { HttpsError, onCall } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import Stripe from "stripe";

interface StartOrderAndCaptureRequest {
  orderId: string;
}

export const startOrderAndCapture = onCall<StartOrderAndCaptureRequest>(
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
    providerId: string | null;
    status: string;
    stripePaymentIntentId?: string | null;
    paymentStatus?: string;
  };

  if (order.providerId !== request.auth.uid) {
    throw new HttpsError("permission-denied", "Only the assigned mechanic can start this job.");
  }

  if (order.status !== "Scheduled") {
    throw new HttpsError("failed-precondition", "Order is not in a startable state.");
  }

  if (order.paymentStatus !== "authorized") {
    throw new HttpsError("failed-precondition", "No authorized deposit hold found.");
  }

  if (!order.stripePaymentIntentId) {
    throw new HttpsError("failed-precondition", "No deposit authorization found.");
  }

  try {
    const paymentIntent = await stripe.paymentIntents.capture(order.stripePaymentIntentId);

    // eslint-disable-next-line no-console
    console.log(`[startOrderAndCapture] captured ${paymentIntent.id} for order ${orderId}`);

    const now = Date.now();
    await orderRef.update({
      status: "InProgress",
      paymentStatus: "deposit_paid",
      depositPaid: true,
      startedAt: now,
      depositCapturedAt: now,
      updatedAt: now,
    });

    return { success: true };
  } catch (err) {
    console.error("[startOrderAndCapture] Stripe error:", err);
    throw new HttpsError("internal", "Unable to capture deposit. Please try again.");
  }
});
