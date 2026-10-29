import { HttpsError, onCall } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import Stripe from "stripe";

interface ReleaseDepositHoldRequest {
  orderId: string;
}

export const releaseDepositHold = onCall<ReleaseDepositHoldRequest>(
  { secrets: ["STRIPE_SECRET_KEY"] },
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
    providerId: string | null;
    stripePaymentIntentId?: string | null;
    paymentStatus?: string;
  };

  // Either the customer or the assigned mechanic can trigger a release.
  const uid = request.auth.uid;
  if (uid !== order.customerId && uid !== order.providerId) {
    throw new HttpsError("permission-denied", "Only the customer or assigned mechanic can release this hold.");
  }

  // No hold to release — return success (idempotent).
  if (!order.stripePaymentIntentId || order.paymentStatus !== "authorized") {
    return { success: true, alreadyReleased: true };
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new HttpsError("failed-precondition", "Stripe secret key is not configured.");
  }

  const stripe = new Stripe(secretKey, { apiVersion: "2026-06-24.dahlia" });

  try {
    await stripe.paymentIntents.cancel(order.stripePaymentIntentId);

    const now = Date.now();
    await orderRef.update({
      paymentStatus: "released",
      depositReleasedAt: now,
      updatedAt: now,
    });

    // eslint-disable-next-line no-console
    console.log(`[releaseDepositHold] released ${order.stripePaymentIntentId} for order ${orderId}`);

    return { success: true };
  } catch (err) {
    console.error("[releaseDepositHold] Stripe error:", err);
    throw new HttpsError("internal", "Unable to release deposit hold.");
  }
});
