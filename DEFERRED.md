# Deferred

Things knowingly left for later. Each entry says why and what "done" looks like.

## Customers can't see inspection photos
- **What:** Mechanic inspection photos are uploaded and saved (`photoUrls` / `photoThumbUrls`
  on the inspection report) but no customer-facing screen displays them. Only the mechanic's
  edit screen shows them.
- **Why deferred:** Needs a design decision on where the report lives in the customer's order
  detail; out of scope for the photo-performance work.
- **Done when:** the customer's order detail shows the inspection report with a photo gallery
  (reuse `PhotoGallery` with `toPhotos(report.photoUrls, report.photoThumbUrls)`).

## Retrying a failed submit reuses the first order
- **What:** If photo upload fails after the order is created, tapping submit again re-uploads to
  the same order (no duplicate). But if the customer edits the form before retrying, those
  edits aren't applied — the order keeps the first submission's text.
- **Why deferred:** There's no customer "edit order" path yet.
- **Done when:** the retry updates the existing order with the current form values, or the form
  locks after the order is created.

## Existing photos stay full size
- **What:** Photos uploaded before compression/thumbnails shipped stay ~5 MB with no thumbnail
  (they fall back to the full image).
- **Done when:** a one-off backfill resizes them, or we accept it for test data.

## Security: rules don't limit which fields can be written  (fix before real customers/money)
Found 2026-09-29 while fact-checking the agent handoff. Nothing here was tested against the
live project; it's read straight from `firestore.rules`.
- **Roles:** `users/{uid}` update allows self to write any field, including `role`. Any signed-in
  user can set `role: "owner"` and gain owner powers (read all users, delete orders, write
  transactions, owner access in Storage rules). Also lets a mechanic edit their own
  `providerProfile.totalEarnings`.
- **Payments:** `repair-orders` update allows customer/provider/owner to change any field, so
  `status`, `paymentStatus`, `remainingBalance`, `depositPaid` can be written from the client,
  bypassing the Cloud Functions. The app itself writes some of these (e.g. `paymentStatus:
  "authorized"` in `order-service.ts`), so tightening needs those moved server-side or allowed
  by field.
- **Done when:** users can only self-set role to customer/provider (never owner); orders limit
  each party to specific fields; payment/status fields are written only by functions.
- Suggested order: roles lockdown (small) → order field restrictions (larger, retest the whole
  payment flow) → owner-only rule for `analytics`.

## Stripe functions can't read their secret
- **What:** `functions/src/payments/*` read `process.env.STRIPE_SECRET_KEY`, but nothing binds
  a secret (`secrets:` option) and there's no `functions/.env`. Secret Manager has no
  `STRIPE_SECRET_KEY` in project `intfixd` (404). The three functions are deployed, so payment
  calls most likely fail with "Stripe secret key is not configured."
- **Done when:** the secret exists and is bound in `onCall({ secrets: [...] }, ...)`, and a real
  test-mode deposit succeeds end to end.
- Also: `functions/` was never built locally (no `node_modules`/`lib`, no predeploy build in
  `firebase.json`), so confirm it compiles before redeploying.

## Owner Earnings screen can't load
- **What:** `analytics-service` reads `analytics/{date}` but `firestore.rules` has no rule for
  it (default deny), and no trigger function writes to it.
- **Done when:** an owner-only read rule exists and something populates the collection.

## recordCashPayment doesn't cap the amount
- **What:** only checks `amount > 0` and that a balance remains; a mechanic can record more
  than `remainingBalance` and inflate `totalEarnings`.
- **Done when:** `amount` is validated against `remainingBalance`.
