---
name: frontend-dev
description: Executes frontend tickets in the Fixd agent loop. Builds screens and components following the 3-tier architecture (page → view → component), shared UI primitives, theme tokens, and memo discipline. Use when an orchestrator-dispatched ticket assigns UI work in src/page/ or app/. Do not use for service-layer, Firebase, or hook-logic work — that belongs to firebase-dev.
---

# Frontend Dev

## Purpose

Execute one UI ticket to its acceptance criteria, leaving behind code that
passes QA on the first review.

## Use This Skill When

- You were dispatched by the orchestrator with a ticket assigning UI work.

## Do Not Use This Skill When

- The ticket is about services, Firestore, hooks with data logic, security
  rules, or Cloud Functions → that is firebase-dev's ticket; mark blocked
  and say so.

## Required Inputs

- Path to the ticket file (`.agents/runs/<run>/TICKET-<NN>.md`).

## Workflow

1. **Read first, in this order:**
   - The ticket. Its Contract is frozen — build against it exactly.
   - `best_practices.md`
   - `guidelines/components.md`, `guidelines/views.md`,
     `guidelines/styling.md` (and `guidelines/architecture.md` if the ticket
     creates a new feature folder)
   - Every file in the ticket's "Read first" list.
   - The closest existing similar feature — copy its shape, then adapt.
2. Implement within the ticket's In-scope paths only:
   - `.page.tsx` = composition only. `.view.tsx` = hooks + decisions.
     `components/` = dumb presentational.
   - Shared primitives first: `AppButton`, `AppTextInput`, `AppCard`,
     `OrderStatusBadge`, `OrderListItem` from `@/components`. New look =
     new variant on the primitive, never inline overrides.
   - Theme tokens only. No hardcoded colors, spacing, font sizes, radii.
   - `memo(function Name(...))` on presentational components; static style
     consts above the component; no inline objects in JSX.
   - Empty state handled inline in the success view.
3. If the ticket creates a new presentational component, follow
   `.agents/skills/build-performant-component/SKILL.md` — skip its
   interactive interview (the ticket supplies the answers) and run its
   scaffold script directly.
4. Run `npm run type-check`. Fix every error before continuing.
5. Write the handoff per `.agents/skills/agent-handoff/SKILL.md` with
   status `needs-review`.
6. If the ticket is manual-tier: also write `MANUAL-TEST-<NN>.md` from
   `.agents/skills/agent-handoff/assets/manual-test-template.md`. For UI
   work, steps must include which screen to open and exactly what should be
   visible; ask for a screenshot when layout is the risk.

## Verification

- Every acceptance criterion in the ticket is met and listed in the
  handoff's Verified section.
- `npm run type-check` passes.
- Nothing outside the In-scope paths was modified.

## Output

- Feature code + `HANDOFF-<NN>.md` (+ `MANUAL-TEST-<NN>.md` on manual tiers).

## Correction Flow

- Contract doesn't fit the UI reality → do NOT improvise around it. Write
  `Status: blocked` naming the exact contract field that fails.
- Type-check failing for reasons outside your scope → still fix your files;
  note the external cause in Open issues.
- Resumed with a QA/user fix list → apply the fixes verbatim, re-run
  type-check, overwrite your handoff.
