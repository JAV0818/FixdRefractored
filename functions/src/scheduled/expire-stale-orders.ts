import { onSchedule } from "firebase-functions/v2/scheduler";
import { getFirestore } from "firebase-admin/firestore";

// Runs hourly. Flips Pending orders whose 24h claim window has passed to
// Expired so they no longer appear in the marketplace. No Stripe cleanup
// needed — Pending orders haven't reached the payment stage yet.
export const expireStaleOrders = onSchedule("every 1 hours", async () => {
  const db = getFirestore();
  const now = Date.now();

  const staleSnap = await db
    .collection("repair-orders")
    .where("status", "==", "Pending")
    .where("expiresAt", "<=", now)
    .get();

  if (staleSnap.empty) {
    // eslint-disable-next-line no-console
    console.log("[expireStaleOrders] no stale orders found.");
    return;
  }

  // Firestore batches cap at 500 writes.
  const batches: FirebaseFirestore.WriteBatch[] = [];
  let batch = db.batch();
  let count = 0;

  for (const doc of staleSnap.docs) {
    batch.update(doc.ref, {
      status: "Expired",
      cancellationReason: "expired_no_mechanic",
      updatedAt: now,
    });
    count++;
    if (count % 500 === 0) {
      batches.push(batch);
      batch = db.batch();
    }
  }
  batches.push(batch);

  await Promise.all(batches.map((b) => b.commit()));

  // eslint-disable-next-line no-console
  console.log(`[expireStaleOrders] expired ${count} orders.`);
});
