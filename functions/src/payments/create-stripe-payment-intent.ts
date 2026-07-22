import { HttpsError, onCall } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import Stripe from "stripe";

interface CreateStripePaymentIntentRequest {
  orderId: string;
}

const DEPOSIT_AMOUNT_CENTS = 2000; // $20.00
const CURRENCY = "usd";

export const createStripePaymentIntent = onCall<CreateStripePaymentIntentRequest>(async (request) => {
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
    depositAmount?: number;
    paymentStatus?: string;
    stripePaymentIntentId?: string | null;
  };

  if (order.customerId !== request.auth.uid) {
    throw new HttpsError("permission-denied", "Only the customer can pay this deposit.");
  }

  if (order.paymentStatus && order.paymentStatus !== "pending") {
    throw new HttpsError("failed-precondition", "Deposit has already been processed.");
  }

  try {
    const amountCents = order.depositAmount ? Math.round(order.depositAmount * 100) : DEPOSIT_AMOUNT_CENTS;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: CURRENCY,
      capture_method: "manual",
      metadata: { orderId, customerId: order.customerId },
    });

    await orderRef.update({
      stripePaymentIntentId: paymentIntent.id,
      paymentStatus: "authorized",
      depositAuthorizedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { clientSecret: paymentIntent.client_secret };
  } catch (err) {
    console.error("[createStripePaymentIntent] Stripe error:", err);
    throw new HttpsError("internal", "Unable to create payment intent.");
  }
});
