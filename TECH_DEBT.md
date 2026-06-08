# Fixd — Technical Debt

Tracked items that we **chose not to finish now** so they're logged and not
silently dropped. Unbuilt *features* live in `ROADMAP.md`; this file is for
corners cut inside work we did ship.

Add to this file whenever you defer something.

## Priority levels

| Level | Meaning |
|---|---|
| 🔴 HIGH | Will break or degrade badly at scale. Fix before launch or immediately after. |
| 🟡 MEDIUM | Noticeable pain at moderate scale or real edge-case failures. Fix in first post-launch sprint. |
| 🟢 LOW | Minor friction or future-proofing. Fix when bandwidth allows. |

---

## 🔴 HIGH — Customer search uses client-side filtering

**File:** `src/services/user-service.ts` → `searchCustomers()`

**Problem:** Fetches the first 100 customers from Firestore and filters by
name/phone in JavaScript. Breaks down fast:
- At ~500 users the 100-doc cap silently drops results (correct customer not in
  the first 100 fetched).
- At ~1,000+ users read cost and latency become unacceptable.
- No typo tolerance, no relevance ranking.

**Fix:** Replace with **Algolia**.
1. Install the Firebase Extension "Search with Algolia" — auto-indexes every
   `users` doc write to Algolia server-side (no custom Cloud Function needed).
2. Create `src/services/search-service.ts` — the only file that imports
   `algoliasearch`. Expose `searchCustomers(term)` filtering on
   `role:customer AND hasCompletedOnboarding:true`.
3. Update `userService.searchCustomers` to delegate to `searchService`.
4. Store `ALGOLIA_APP_ID` and `ALGOLIA_SEARCH_KEY` (search-only, read-safe) in
   `.env`. Never bundle the admin key.
5. Remove the `collection`, `getDocs`, `limit`, `where` imports added to
   `user-service.ts` for the interim approach.

Hook and view don't change — only the service layer swaps.

**Target:** Before or immediately after launch (M10 window).

---

## 🔴 HIGH — Marketplace pagination is client-side reveal, not cursor-based

**File:** `src/services/order-service.ts` → `getAvailableOrders()` / `subscribeToAvailableOrders()`

**Problem:** A `limit(50)` cap is applied and the UI reveals `MARKETPLACE_PAGE_SIZE`
items at a time. Once the live pool exceeds 50 orders, newer requests are silently
invisible to mechanics. Also, the client-side expiry filter (no M10 expire function
yet) compounds this — expired orders consume the 50-doc budget.

**Fix:** Switch to `useInfiniteQuery` + Firestore `startAfter(lastDoc)` cursor
pagination once the M10 expire Cloud Function is live (so expired orders are
flipped server-side and don't pollute paginated results).

---

## 🟡 MEDIUM — Orphan-user writes assume the user doc exists

**Files:** `src/services/user-service.ts` → `saveVehicle`, `saveMechanicProfile`,
`completeOnboarding`, `setAvailability`, `updateMechanicAbout`

**Problem:** All use `updateDoc`, which throws if the `users/{uid}` doc doesn't
exist. Currently covered by always using fresh accounts created via the normal
auth flow — but a partially-onboarded account or a doc accidentally deleted would
surface this as a silent crash.

**Fix:** Ensure-doc-on-login inside `AuthProvider` (`setDoc(..., { merge: true })`
with default fields), or switch these calls to `setDoc(..., { merge: true })`.
Resolves the `completeOrder` job-counter issue and availability toggle caveat
below at the same time.

---

## 🟡 MEDIUM — `completeOrder` job-counter assumes `providerProfile` exists

**File:** `src/services/order-service.ts` → `completeOrder()`

**Problem:** Uses `increment(1)` on `providerProfile.totalJobsCompleted`. A mechanic
whose user doc has no `providerProfile` map (incomplete onboarding) would produce
a broken nested-field update. In practice onboarded mechanics have it — but the
guarantee is implicit, not enforced.

**Fix:** Tied to the orphan-user item above. Once the doc is guaranteed to have
`providerProfile`, this is safe. Alternatively, guard with a transaction read.

---

## 🟡 MEDIUM — Inspection: curated checklist, not the full DVI

**File:** `src/page/inspection-checklist/inspection-checklist.constants.ts`

**Problem:** V1 ships a trimmed set of checkpoints. The old app had ~50 across:
Interior (16) / Under Hood (12) / Diagnostic (4) / Under Vehicle (13) /
Tires & Brakes / Maintenance.

**Fix:** Add the remaining sections and items to the checklist config — the
structure already supports it. Source of truth: old repo
`screens/provider/requests/InspectionChecklistScreen.tsx`.

---

## 🟡 MEDIUM — No "final" inspection report

**File:** `src/services/inspection-service.ts`

**Problem:** The old data path was `.../inspectionReport/initial` — the `initial`
slug implied an initial + final report. V1 only does one report.

**Fix:** Support a second `final` report at job completion. Add a `reportType:
"initial" | "final"` field and a second save flow triggered at completion.

---

## 🟡 MEDIUM — Onboarding specialties diverge from the canonical taxonomy

**Files:** `src/page/onboarding/mechanic-profile.page.tsx`

**Problem:** The profile About editor picks from `SERVICE_CATEGORY_LABELS`
(canonical, shared with `order.categories[]`), but the mechanic-profile
onboarding screen still uses its own inline list with different labels
("Brakes" vs "Brake Service"). Specialties written during onboarding won't
match filters that use the canonical taxonomy.

**Fix:** Point onboarding at `SERVICE_CATEGORY_LABELS` (or `FilterChips`) so
specialties are consistent everywhere.

---

## 🟡 MEDIUM — Profile edits incomplete

**Files:** `src/page/profile/`

**Problem:** The profile screen covers name/phone, avatar, availability toggle,
and (mechanic) bio + specialties. Still missing:
- Customer: vehicle add / edit / remove
- Mechanic: years-of-experience editing

**Fix:** Add edit UIs over `saveVehicle` (+ remove/update path) and add
`yearsExperience` to the About editor.

---

## 🟢 LOW — Live hooks have no cross-screen shared cache

**File:** `src/hooks/use-firestore-subscription.ts`

**Problem:** Each mounted component that calls an `onSnapshot`-backed hook opens
its own Firestore listener. Two screens watching the same order = two listeners,
no dedup, no React Query devtools visibility.

**Fix (only if needed at scale):** Bridge snapshots into the React Query cache
via `queryClient.setQueryData([...], data)` inside the listener — keeps real-time
updates *and* the shared cache. Not urgent; fine at current scale.

---

## 🟢 LOW — UI primitives sweep not fully complete

**Files:** `src/page/onboarding/vehicle-setup.page.tsx`,
`src/page/onboarding/mechanic-profile.page.tsx`, `line-item-row` components

**Problem:** Onboarding inline inputs and the dense `line-item-row` inputs were
not migrated to `AppTextInput`. The `date-time-field` modal buttons (Cancel /
Next / Done) still use Paper `Button`, not `AppButton`.

**Fix:** `AppTextInput` now has a `containerStyle` flex escape hatch that unblocks
the line-item migration. Straightforward sweep — no logic changes.

---

## 🟢 LOW — Empty-state UX not standardized

**Noted also in:** `ROADMAP.md`

**Problem:** Each success view handles its own empty case inline with varying copy
and layout. Loading but empty can look like a broken screen on first open.

**Fix:** One shared `EmptyState` component (illustration + title + body + optional
CTA) reused across Requests, Queue, Marketplace, Messages, etc.

---

## 🟢 LOW — No signatures on inspection reports

**Problem:** The old app skipped them too. No signature-pad integration exists.

**Fix:** Add customer sign-off (signature pad library) if legally required before
launch or at a partner's request.
