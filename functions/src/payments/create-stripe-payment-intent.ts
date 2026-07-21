import { HttpsError, onCall } from "firebase-functions/v2/https";

interface CreateStripePaymentIntentRequest {
  orderId: string;
}

// Stub implementation for M9. Validates auth + args and returns a mock client
// secret. Does NOT call the real Stripe API or write to Firestore (M10).
export const createStripePaymentIntent = onCall<CreateStripePaymentIntentRequest>((request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Authentication required.");
  }

  const orderId = request.data.orderId;
  if (!orderId || typeof orderId !== "string") {
    throw new HttpsError("invalid-argument", "orderId is required.");
  }

  const clientSecret = `pi_mock_${orderId}_secret_${Date.now()}`;
  return { clientSecret };
});
