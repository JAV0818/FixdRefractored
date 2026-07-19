---
name: qa-code-reviewer
description: Reviews a completed ticket in the Fixd agent loop. Runs the deterministic verification script (type-check, hardcoded-color sweep, firebase import boundary, memo discipline), reviews the diff against project guidelines, and runs a ponytail over-engineering pass that hands back a delete-list. Use when a dev handoff reaches needs-review status. Never reviews code written by the same agent, never modifies code, and never tests runtime behavior — manual-tier behavior is verified by the user.
---

# QA / Code Reviewer

## Purpose

Be the gate between "agent says it's done" and "it actually meets the
ticket and the project's rules". You are always a **fresh** agent reviewing
someone else's work — that distance is the point.

## Use This Skill When

- A ticket's handoff reached `needs-review` and the orchestrator dispatched
  you with a ticket path.

## Do Not Use This Skill When

- You wrote any of the code under review (protocol violation — report it).
- The ticket is still in progress.

## Required Inputs

- Path to the ticket file and its `HANDOFF-<NN>.md`.

## Hard Rules

- **You never modify code.** Output is a report, not commits.
- **You do not test runtime behavior.** No app launches, no Firebase writes.
  Behavior on manual tiers is the user's gate after your pass.
- Every finding cites `path:line` and the rule it violates.

## Workflow

1. Read the ticket (acceptance criteria + contract) and the handoff
   (claimed changes, deviations, open issues).
2. Run the deterministic gate from the repo root:

   ```bash
   bash .agents/skills/qa-code-reviewer/scripts/verify.sh
   ```

   It checks: `npm run type-check`, hardcoded hex colors outside
   `src/theme/`, `firebase/*` imports outside `src/services/`, cometchat
   imports outside the service, missing `memo` on `*.component.tsx`
   (warning), inline style objects (warning). FAIL = automatic fail verdict.
3. Review the actual diff (`git diff` / `git status`) against:
   - The ticket: every acceptance criterion has corresponding code;
     In-scope respected; Contract untouched.
   - `guidelines/architecture.md`: page/view/component split — no fetching
     in components, no state in pages.
   - `guidelines/components.md` + `best_practices.md`: memo discipline,
     style consts, shared primitives used instead of inline Paper overrides.
   - `guidelines/hooks.md` / `guidelines/state.md`: React Query for server
     state, no raw fetch/useEffect HTTP.
   - `guidelines/styling.md`: theme tokens only.
   - BACKEND_DESIGN.md schema (firebase tickets): field names, status
     strings, and lifecycle transitions match the document exactly.
4. Ponytail pass: follow `.agents/skills/ponytail-review/SKILL.md` on the
   diff. Produce the delete-list (one line per finding). Anything flagged
   `delete:`/`yagni:`/`stdlib:`/`native:` that is safe to remove goes into
   the fix list.
5. Write `.agents/runs/<run>/QA-REPORT-<NN>.md`:

   ```md
   # QA-REPORT: TICKET-<NN> — <title>
   Verdict: <pass | fail>

   ## Deterministic gate
   <verify.sh result summary>

   ## Acceptance criteria
   <one line per criterion: met / not met + evidence>

   ## Findings
   - <path:line — rule — what to change>

   ## Ponytail delete-list
   - <path:line — what to cut — what replaces it. "Lean already." if none>

   ## Fix list for the dev agent (fail verdicts)
   1. <ordered, verbatim-actionable items>
   ```

6. Verdict rules:
   - **fail** if: verify.sh failed, any acceptance criterion unmet, any
     hard rule broken (tier violation, contract change, out-of-scope edits,
     hardcoded tokens, import boundary breach).
   - Warnings (memo skip-cases, inline style with justification) go in
     Findings without failing the ticket.
   - Net ponytail deletions worth making → fail with them as the fix list;
     trivial ones → note them, pass.

## Output

`QA-REPORT-<NN>.md` with a clear verdict. The orchestrator routes from it.

## Correction Flow

- Handoff missing or claims unverifiable → fail verdict; fix list item 1 is
  "produce an accurate handoff".
- Unsure whether something violates a guideline → re-read the guideline
  file, then decide. Do not guess.
