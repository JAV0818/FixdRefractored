# Fixd — Launch Plan & Dated Schedule

> Written: September 22, 2026
> Revenue target: $50k by January 22, 2027 (4 months)
> App Store target: October 6, 2026
> This document is the execution authority. Update dates as actuals come in.

---

## Revenue Math

To hit $50k in 4 months you need one of these to be true:

| Scenario | Mechanics | Jobs/mechanic/month | Months | Revenue/job | Total |
|---|---|---|---|---|---|
| Cash only (deposit) | 50 | 10 | 4 | $20 | $40k — short |
| Cash + Stripe Connect fee (5%) | 30 | 15 | 4 | $20 + ~$12 fee | ~$52k |
| Conservative | 20 | 8 | 4 | $32 avg | $20k — not enough |

Bottom line: Stripe Connect (Phase 2) is required to hit $50k. Cash-only deposits
alone don't get there at realistic mechanic counts. Target is 30+ active mechanics
by December 1 with Stripe Connect live by November 1.

---

## PHASE 1 — LAUNCH READY
### Target: App submitted to App Store by October 6, 2026

---

### Week 1: Sep 22 – Sep 28 — Backend Deploy + M4 Gaps

#### Sep 23 (Tuesday) — Deploy what's already written
GOAL: Payment functions and security rules live in production.

Tasks:
- `firebase deploy --only functions` — deploy createStripePaymentIntent, captureDepositAndApproveQuote, recordCashPayment
- `firebase deploy --only firestore:rules,storage` — rules are written, just ship them
- Add missing analytics collection rule to firestore.rules before deploy
- Smoke test: create order → call createStripePaymentIntent via Firebase console emulator → verify clientSecret
- Smoke test: cash payment → recordCashPayment → verify transaction doc in Firestore console

EXIT CRITERIA: All 3 payment functions callable from app without error. Rules deployed.

#### Sep 24–25 (Wed–Thu) — Trigger Cloud Functions
GOAL: Orders expire automatically. New users get a Firestore doc on signup.

Tasks (firebase-dev agent):
- Build `functions/src/triggers/expire-orders.ts` — Pub/Sub scheduled hourly, queries Pending orders where expiresAt < now, batch-updates status to Expired
- Build `functions/src/triggers/on-order-create.ts` — Firestore onCreate: sets expiresAt = createdAt + 24hrs (server-side backup)
- Build `functions/src/triggers/on-user-create.ts` — Auth onCreate: creates users/{uid} doc with defaults (role: null, hasCompletedOnboarding: false). Kills the orphan-user HIGH debt item.
- Export all 3 from functions/src/index.ts
- Deploy: `firebase deploy --only functions`

EXIT CRITERIA: Create a test user → users/{uid} doc auto-created. Create Pending order → wait 24h+ → order shows Expired.

#### Sep 26–27 (Fri–Sat) — M4 Gaps: Vehicle Management + Account Settings
GOAL: Customers can manage vehicles and change their email/password from profile.

Tasks (frontend-dev agent):
- Vehicle management screen: list vehicles, add vehicle (reuse onboarding form), delete vehicle
- Wire into (customer-tabs)/profile → vehicles route
- Account settings screen: change email (auth-service.updateEmail), change password (link to existing change-password page)
- Wire into (customer-tabs)/profile → account-settings route
- No new services needed — all methods already exist on auth-service and user-service

EXIT CRITERIA: Customer can add a second vehicle. Customer can change their password from profile tab.

---

### Week 2: Sep 29 – Oct 5 — Push Notifications + Build

#### Sep 29–Oct 1 (Mon–Wed) — Push Notifications
GOAL: Mechanic gets notified when a new order lands. Customer gets notified when quote is ready.

Tasks:
- Create `src/services/notification-service.ts`: registerForPushNotifications(), saveFCMToken(uid, token), handleForegroundNotification(), handleNotificationResponse()
- Wire token registration in app/_layout.tsx after auth hydration
- Store fcmToken on users/{uid}.fcmToken in Firestore
- Build `functions/src/triggers/on-order-status-change.ts`:
  - status = Pending → FCM to all available providers (query users where role=provider, isAvailable=true)
  - status = QuoteProposed → FCM to customer
  - status = Scheduled → FCM to both parties
- Deploy functions + app

EXIT CRITERIA: Test end-to-end: submit quote request → mechanic device receives push. Provider proposes quote → customer device receives push.

#### Oct 2–3 (Thu–Fri) — End-to-End Smoke Test
GOAL: One full order lifecycle works on real devices with no crashes.

Test script (run manually on real devices):
1. Customer creates account, completes onboarding with vehicle
2. Customer submits quote request with photos
3. Mechanic sees order in marketplace, accepts it
4. Mechanic proposes quote
5. Customer gets push notification, opens app, approves quote + pays $20 deposit via Stripe test card
6. Mechanic sees order scheduled, starts job, completes inspection
7. Mechanic marks job complete, records cash payment
8. Both parties see order as Completed in their tabs
9. Admin account can see the order in admin-orders, the mechanic in admin-mechanics

If Stripe test payment fails → debug before Oct 4.
If push fails → debug before Oct 4.

EXIT CRITERIA: Full lifecycle completes without crashes or silent failures.

#### Oct 4–5 (Sat–Sun) — App Store Build + Submission
GOAL: Binary submitted to App Store Connect for review.

Tasks:
- EAS production build: `eas build --platform all --profile production`
- Update app store screenshots and description in App Store Connect
- Submit for review (typical review time: 24-48h)
- TestFlight internal test with real mechanic + customer on their devices

EXIT CRITERIA: Binary accepted by App Store Connect (not necessarily approved yet).

---

### Oct 6–8 — App Store Review Window
Apple typically reviews in 24-48h. Use this time to:
- Onboard first 3-5 mechanics (hand-hold them through the mechanic flow)
- Set up mechanic support channel (iMessage group or Telegram)
- Prepare any rejection response if review comes back with issues

#### Oct 8 (Thursday) — TARGET LAUNCH DATE
App live on App Store and Google Play.

---

## PHASE 2 — GROWTH
### Target: 30 active mechanics, Stripe Connect live by November 1

---

#### Oct 9–12 — Algolia Customer Search
GOAL: Mechanics can search customers without the 100-doc silent cap.

Tasks:
- Install Firebase Algolia extension in Firebase console (auto-indexes users collection)
- Create `src/services/search-service.ts` — only file importing algoliasearch
- Expose searchCustomers(term) filtering on role:customer AND hasCompletedOnboarding:true
- Update user-service.searchCustomers to delegate to search-service
- Store ALGOLIA_APP_ID and ALGOLIA_SEARCH_KEY in .env

EXIT CRITERIA: Mechanic custom-quote search returns correct results at any user count.

#### Oct 13–15 — Cursor-Based Marketplace Pagination
GOAL: Marketplace doesn't silently drop orders when pool exceeds 50.

Tasks:
- Switch subscribeToAvailableOrders to useInfiniteQuery + startAfter(lastDoc) cursor
- Requires expire-orders function live (done since Sep 25) so expired orders don't pollute results
- Add "Load more" trigger at bottom of marketplace FlatList

EXIT CRITERIA: Marketplace correctly shows all Pending orders with no 50-doc cap.

#### Oct 16–Nov 1 — Stripe Connect (M11): Mechanics Accept Card Payments
GOAL: Mechanics can accept card final payments. Fixd earns application fee per job.

This is the revenue unlock. Without it you're capped at $20/job.

Week 1 (Oct 16–22) — Backend:
- Create Stripe Express connected accounts callable function
- Get onboarding link callable function
- Stripe webhook handler for account.updated
- Add stripeConnectedAccountId + onboarding fields to ProviderDetails type
- stripe_accounts/{stripeAccountId} reverse-lookup collection

Week 2 (Oct 23–29) — Frontend:
- Provider profile → Stripe Connect screen (connect / complete onboarding / connected states)
- Deep-link handler at app/stripe-connect.tsx for Stripe return/refresh URLs
- Service wrappers + React Query hooks

Week 3 (Oct 30–Nov 1) — Final Payment Intent:
- createFinalPaymentIntent function: PaymentIntent on connected account, application fee, transfer_data
- captureFinalPayment: captures PI, writes final_payment transaction, marks order paid
- Wire into collect-payment screen on provider side
- Update admin earnings to show application fees + card volume

EXIT CRITERIA: Mechanic completes Stripe Express onboarding. Customer pays final balance via card. Fixd application fee appears in Stripe dashboard. Mechanic payout scheduled.

#### Nov 3–5 — Analytics Cloud Function
GOAL: Admin earnings dashboard shows real numbers.

Tasks:
- Build generate-daily-analytics.ts: scheduled midnight, aggregates to analytics/daily/{date} + analytics/mechanics/{uid}
- Admin earnings screen shows real platform fee total, per-mechanic earnings, order counts

---

## PHASE 3 — SCALE
### November 2026 onward — build what the market tells you to build

- Full 50-item DVI inspection checklist (Nov)
- Final inspection report at job completion (Nov)
- Customer ratings + reviews on mechanics (Dec)
- iOS Firebase Storage native migration — when RNFirebase v27 or Expo 55 resolves the 3-way conflict
- EmptyState UX standardization
- Map integration for job location (if demand exists)

---

## Mechanic Acquisition Schedule (parallel to code work)

This runs on YOUR time, not the factory's. Code ships regardless.

| Date | Mechanic Target | Action |
|---|---|---|
| Sep 22 | 0 → 3 mechanics lined up | Cold outreach NOW. Friends, local shops, Craigslist. |
| Oct 1 | 5 mechanics on TestFlight | Hand them the app, walk them through the mechanic flow |
| Oct 8 (launch) | 5 active mechanics | At least 1 job completed before launch day |
| Oct 31 | 15 active mechanics | Referral incentive: first month fee waived |
| Nov 30 | 30 active mechanics | Stripe Connect live — pitch the card payment upgrade |
| Dec 31 | 50 active mechanics | $10k/month run rate minimum |

---

## Revenue Milestones

| Date | Revenue Target | How |
|---|---|---|
| Oct 31 | $1,000 | 50 jobs at $20 deposit. Proof of concept. |
| Nov 30 | $5,000 | 100 jobs at $20 + early Stripe Connect fees |
| Dec 31 | $20,000 | 200 jobs, Stripe Connect fully live, $50-60 avg revenue/job |
| Jan 22, 2027 | $50,000 cumulative | 300+ jobs in Jan at full rate, or strong Dec to bank it |

---

## Critical Path Summary

Sep 23 → Functions deployed
Sep 25 → Trigger functions built + deployed
Sep 27 → M4 vehicle + account settings
Oct 1 → Push notifications live
Oct 3 → Full smoke test passes
Oct 6 → App Store submission
Oct 8 → Launch
Oct 16 → Stripe Connect starts
Nov 1 → Stripe Connect live (revenue unlock)
Nov 30 → 30 active mechanics
Jan 22 → $50k

Stripe Connect on Nov 1 is the gate. If that slips, the revenue target slips.
Everything else is noise.

---

## Blockers That Kill the Timeline

1. App Store rejection — have a response ready, 48h turnaround
2. Stripe Connect onboarding friction for mechanics — test this yourself before rolling out
3. Mechanic acquisition stalls — the code is done but there's nobody using it
4. iOS Firebase Storage blowing up at scale — mitigated, images stay under 3MB
5. CometChat hitting rate limits with real traffic — monitor, upgrade plan if needed
