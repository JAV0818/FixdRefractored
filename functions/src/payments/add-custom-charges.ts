import { HttpsError, onCall } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";

interface OrderItem {
  description: string | null;
  name: string;
  price: number;
  quantity: number;
}

interface AddCustomChargesRequest {
  orderId: string;
  newItems: OrderItem[];
}

const PLATFORM_DEPOSIT = 20;

export const addCustomCharges = onCall<AddCustomChargesRequest>(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Authentication required.");
  }

  const { orderId, newItems } = request.data;
  if (!orderId || typeof orderId !== "string") {
    throw new HttpsError("invalid-argument", "orderId is required.");
  }
  if (!Array.isArray(newItems) || newItems.length === 0) {
    throw new HttpsError("invalid-argument", "newItems must be a non-empty array.");
  }

  const providerId = request.auth.uid;
  const db = getFirestore();
  const orderRef = db.collection("repair-orders").doc(orderId);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(orderRef);
    if (!snap.exists) {
      throw new HttpsError("not-found", "Order not found.");
    }

    const data = snap.data() as {
      providerId: string | null;
      status: string;
      items: OrderItem[];
    };

    if (data.providerId !== providerId) {
      throw new HttpsError("permission-denied", "Only the assigned mechanic can add charges.");
    }

    if (data.status !== "InProgress") {
      throw new HttpsError("failed-precondition", "Charges can only be added to an in-progress order.");
    }

    const updatedItems = [...data.items, ...newItems];
    const earnings = updatedItems.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const totalPrice = earnings + PLATFORM_DEPOSIT;

    tx.update(orderRef, {
      items: updatedItems,
      totalPrice,
      remainingBalance: Math.max(totalPrice - PLATFORM_DEPOSIT, 0),
      updatedAt: Date.now(),
    });
  });

  // eslint-disable-next-line no-console
  console.log(`[addCustomCharges] added ${newItems.length} items to order ${orderId}`);

  return { success: true };
});
