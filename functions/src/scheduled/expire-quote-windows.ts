import { onSchedule } from "firebase-functions/v2/scheduler";
import { getFirestore } from "firebase-admin/firestore";
import Stripe from "stripe";

// Runs hourly. Flips QuoteProposed orders whose 2-day approval window has
// passed to Expired. If a Stripe auth hold exists, releases it so the
// customer's card is freed.
export const expireQuoteWindows = onSchedule(
  { schedule: "every 1 hours", secrets: ["STRIPE_SECRET_KEY"] },
  async () => {
  const db = getFirestore();
  const now = Date.now();

  const staleSnap = await db
    .collection("repair-orders")
    .where("status", "==", "QuoteProposed")
    .where("quoteExpiresAt", "<=", now)
    .get();

  if (staleSnap.empty) {
    // eslint-disable-next-line no-console
    console.log("[expireQuoteWindows] no expired quotes found.");
    return;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  let stripe: Stripe | null = null;
  if (secretKey) {
    stripe = new Stripe(secretKey, { apiVersion: "2026-06-24.dahlia" });
  }

  let count = 0;

  for (const doc of staleSnap.docs) {
    const data = doc.data() as {
      stripePaymentIntentId?: string | null;
      paymentStatus?: string;
    };

    // Release the Stripe hold if one was authorized but never captured.
    if (stripe && data.stripePaymentIntentId && data.paymentStatus === "authorized") {
      try {
        await stripe.paymentIntents.cancel(data.stripePaymentIntentId);
        await doc.ref.update({
          paymentStatus: "released",
          depositReleasedAt: now,
        });
        // eslint-disable-next-line no-console
        console.log(`[expireQuoteWindows] released hold ${data.stripePaymentIntentId}`);
      } catch (err) {
        console.error(`[expireQuoteWindows] failed to release hold for order ${doc.id}:`, err);
        // Continue — expire the order even if the hold release fails.
      }
    }

    await doc.ref.update({
      status: "Expired",
      cancellationReason: "quote_expired",
      updatedAt: now,
    });
    count++;
  }

  // eslint-disable-next-line no-console
  console.log(`[expireQuoteWindows] expired ${count} quotes.`);
});
