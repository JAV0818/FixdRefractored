---
name: firebase-dev
description: Executes backend/data tickets in the Fixd agent loop. Implements Firebase service methods (the only layer importing firebase SDKs), React Query hooks, Firestore types, security rules drafts, and Cloud Function stubs per BACKEND_DESIGN.md. Use when an orchestrator-dispatched ticket assigns data-layer work. Do not use for UI components or screens — that belongs to frontend-dev.
---

# Firebase Dev

## Purpose

Execute one data-layer ticket to its acceptance criteria, against the real
schema in BACKEND_DESIGN.md, without ever endangering production data.

## Use This Skill When

- You were dispatched by the orchestrator with a ticket assigning
  service/hook/schema/rules/functions work.

## Do Not Use This Skill When

- The ticket is UI/screens → mark blocked, that is frontend-dev's work.

## Required Inputs

- Path to the ticket file (`.agents/runs/<run>/TICKET-<NN>.md`).

## Hard Safety Rules

- **Never deploy.** Write `firestore.rules` / functions code as files only.
  `firebase deploy` is run by the user, never by an agent.
- **Never mutate production data ad hoc.** No one-off Firestore writes,
  deletes, or migrations "to test". Verification happens through the app's
  own services during the user's manual test.
- **Never read `.env` or echo secrets.** You may reference variable *names*.
- Tickets touching security rules, prod functions, destructive ops, or
  Stripe keys are always `manual-always` — if the ticket says otherwise,
  mark blocked and flag the tier mismatch.

## Workflow

1. **Read first, in this order:**
   - The ticket. Its Contract is frozen.
   - `BACKEND_DESIGN.md` (the collections and lifecycle sections for your
     ticket), `best_practices.md`, `guidelines/hooks.md`,
     `guidelines/state.md`
   - Every file in the ticket's "Read first" list — especially the service
     you are extending and `src/types/` interfaces.
2. Implement within In-scope paths only:
   - Service methods in `src/services/<domain>-service.ts`. Services are
     the **only** files importing `firebase/*`. One service per collection.
   - Hooks in `src/page/<feature>/hooks/use-<name>.ts` — React Query
     wrappers per `guidelines/hooks.md` (queryKey = resource + params,
     `enabled` guards, `invalidateQueries` in mutation `onSuccess`).
     Live reads use the existing `use-firestore-subscription` pattern.
   - **Before choosing the read pattern, ask: "Is this data written by one
     role and read by another?"** If yes → `onSnapshot` subscription via
     `useFirestoreSubscription`, never a one-shot `useQuery`/`getDocs`.
     One-shot reads are only acceptable for single-user-owned data (own
     profile, own vehicles). See `guidelines/state.md` "Hard rule —
     multi-role data must be live." Violating this creates stale-data bugs
     that are invisible during single-user testing.
   - Types in the feature's `interfaces/` or `src/types/`. Alphabetized
     members per best_practices.
   - If the ticket needs a new Firestore data path, follow
     `.agents/skills/data-hook-firebase/SKILL.md` — skip its interactive
     interview (the ticket supplies the answers) and run its scaffold
     script directly.
   - Keep writes atomic where the design demands it (transactions /
     batched writes) — see existing `order-service.ts` patterns.
3. Run `npm run type-check`. Fix every error.
4. Write the handoff per `.agents/skills/agent-handoff/SKILL.md`.
5. Manual-tier ticket → write `MANUAL-TEST-<NN>.md` from
   `.agents/skills/agent-handoff/assets/manual-test-template.md`. Steps must
   name the accounts, the exact taps, and the **Firebase console
   checkpoints**: `<collection>/<doc>.<field>` → expected value, so the
   user can verify stored state directly.

## Verification

- Every acceptance criterion met and listed in the handoff.
- `npm run type-check` passes.
- No `firebase/*` import outside `src/services/` (QA's script will check —
  beat it to it).

## Output

- Service/hook/type code + `HANDOFF-<NN>.md` (+ `MANUAL-TEST-<NN>.md` on
  manual tiers).

## Correction Flow

- Contract field conflicts with the live schema in BACKEND_DESIGN.md →
  `Status: blocked`, name the conflict precisely.
- Resumed with a QA/user fix list → apply verbatim, re-run type-check,
  overwrite the handoff.
