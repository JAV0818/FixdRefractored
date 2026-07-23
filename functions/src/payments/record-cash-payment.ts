import { HttpsError, onCall } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

interface RecordCashPaymentRequest {
  amount: number;
  orderId: string;
}

export const recordCashPayment = onCall<RecordCashPaymentRequest>(async (request) => {
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

  const providerId = request.auth.uid;
  const db = getFirestore();
  const orderRef = db.collection("repair-orders").doc(orderId);
  const orderSnap = await orderRef.get();

  if (!orderSnap.exists) {
    throw new HttpsError("not-found", "Order not found.");
  }

  const order = orderSnap.data() as {
    customerId: string;
    providerId: string | null;
    remainingBalance: number;
    status: string;
    totalPrice: number;
  };

  if (order.providerId !== providerId) {
    throw new HttpsError("permission-denied", "Only the assigned mechanic can record payment.");
  }

  if (order.status !== "InProgress" && order.status !== "Completed") {
    throw new HttpsError("failed-precondition", "Payment can only be recorded for active or completed jobs.");
  }

  if (order.remainingBalance <= 0) {
    throw new HttpsError("failed-precondition", "No remaining balance to record.");
  }

  const now = Date.now();
  const platformFee = 0; // Cash jobs: platform already collected $20 deposit; no additional fee
  const providerEarnings = amount;

  const batch = db.batch();

  // Record the cash transaction.
  const transactionRef = db.collection("transactions").doc();
  batch.set(transactionRef, {
    orderId,
    customerId: order.customerId,
    providerId,
    amount,
    platformFee,
    providerEarnings,
    method: "cash",
    type: "final_payment",
    status: "completed",
    notes: null,
    stripeChargeId: null,
    stripePaymentIntentId: null,
    createdAt: now,
    completedAt: now,
  });

  // Mark the order as fully paid and clear the remaining balance.
  batch.update(orderRef, {
    remainingBalance: 0,
    paymentStatus: "paid",
    updatedAt: now,
  });

  // Credit the mechanic's lifetime earnings.
  const providerRef = db.collection("users").doc(providerId);
  batch.update(providerRef, {
    "providerProfile.totalEarnings": FieldValue.increment(providerEarnings),
  });

  await batch.commit();

  // eslint-disable-next-line no-console
  console.log(`[recordCashPayment] recorded ${amount} for order ${orderId}`);

  return { success: true };
});
