# Deferred work / conscious shortcuts

The running log of things we **chose not to finish now**, so they're tracked and
not silently dropped. Each entry: what was cut, why, and what finishing it needs.
(Unbuilt *features* live in `ROADMAP.md`; this file is for corners cut inside work
we did ship.) Add to this file whenever you defer something.

---

## Inspection (DVI)

- **Curated checklist, not the full DVI.** V1 ships a trimmed set of checkpoints;
  the old app had ~50 across Interior (16) / Under Hood (12) / Diagnostic (4) /
  Under Vehicle (13) / Tires & Brakes / Maintenance. **To finish:** add the
  remaining sections/items to the checklist config (structure already supports
  it). Source of truth for the full list: old repo `screens/provider/requests/
  InspectionChecklistScreen.tsx`.
- **No "final" inspection report.** Old data path was `.../inspectionReport/initial`
  — the `initial` slug implied an initial + final report. V1 does the one report.
  **To finish:** support a second `final` report at completion.
- **No signatures.** The old app skipped them too. **To finish:** add customer
  sign-off (signature pad) if/when required.

## UI primitives sweep (not fully complete)

- **Onboarding inline inputs** (`vehicle-setup.page`, `mechanic-profile.page`) and
  the dense **`line-item-row`** inputs were not migrated to `AppTextInput`
  (line-item needs a flex `containerStyle` escape hatch first).
- **`date-time-field` modal buttons** (Cancel/Next/Done) still use Paper `Button`,
  not `AppButton`.

## Data layer

- **Marketplace pagination is client-side reveal** (`limit(50)` + "Load more"),
  not true Firestore cursor pagination. **To finish:** `useInfiniteQuery` +
  `startAfter`, once the pool can exceed 50 and the M10 expire function flips
  expired orders server-side.
- **Orphan-user writes.** `saveVehicle` / `saveMechanicProfile` /
  `completeOnboarding` use `updateDoc`, which assumes the user doc exists.
  Covered for now by always using fresh accounts. **To finish:** ensure-doc-on-
  login in `AuthProvider`, or `setDoc(..., { merge: true })`.
- **Live hooks have no cross-screen shared cache.** The `onSnapshot` hooks
  (`useFirestoreSubscription`) each open their own listener per mount — two
  components watching the same order = two listeners, no dedup, no React Query
  devtools. Fine at current scale. **Scaling lever (only if needed):** bridge
  snapshots into the React Query cache via `queryClient.setQueryData([...], data)`
  inside the listener — keeps real-time updates *and* the shared cache.
- **`completeOrder` job-counter assumes `providerProfile` exists.** It does
  `increment(1)` on `providerProfile.totalJobsCompleted`; a mechanic whose user
  doc has no `providerProfile` map (never finished provider onboarding) could
  fail that nested update. In practice onboarded mechanics have it. **To finish:**
  guard / ensure the map exists (ties into the orphan-user item above).

## Cross-cutting

- **Empty-state UX** isn't standardized (also noted in `ROADMAP.md`).
