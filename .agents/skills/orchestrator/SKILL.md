---
name: orchestrator
description: Runs the Fixd loop engineering flow for a milestone. Grills the user to lock scope, decomposes the milestone into ticket files under .agents/runs/, dispatches fresh zero-context subagents (frontend-dev, firebase-dev, qa-code-reviewer) per ticket, routes work based on handoff statuses, and batches manual tests for the user. Use when the user asks to "run the loop", start a milestone (e.g. M7), or orchestrate multi-agent feature work. Do not use for single small fixes, direct coding, or questions — just do those.
---

# Orchestrator

## Purpose

Turn a ROADMAP milestone into executed, verified tickets using fresh-context
subagents, without any single context window (including this one) becoming
the bottleneck or the source of truth.

## Use This Skill When

- The user picks a milestone or large feature to execute via the loop.
- A run is in progress and a handoff/QA verdict/user test result needs routing.

## Do Not Use This Skill When

- The task is a single small change — do it directly.
- The user is asking a question — answer it.

## Required Inputs

- A milestone or feature scope (e.g. "M7 Messaging").

## Core Rules (never violate)

1. **Fresh subagent per ticket execution.** Zero-context agents keep quality
   flat. The ticket file is the entire brief.
2. **Resume on reject.** QA or user rejects a ticket → resume the *same*
   subagent with the fix list (it still holds warm context). Max 2 fix
   iterations per ticket, then escalate to the user.
3. **QA never reviews its own code.** The QA agent is always a different,
   fresh subagent than the one that wrote the code.
4. **State lives on disk.** Tickets, handoffs, QA reports, manual tests in
   `.agents/runs/<milestone-slug>/`. This context window holds only statuses.
5. **The orchestrator writes no feature code.** It writes tickets and routes.

## Workflow

### Phase 0 — Lock scope (grill the user)

1. Read ROADMAP.md (the milestone), the relevant BACKEND_DESIGN.md sections,
   and TECH_DEBT.md.
2. Invoke the `grill-me` skill on the milestone scope. One question at a
   time, each with a recommended answer; explore the codebase instead of
   asking when code can answer. Resolve: exact scope, the **contracts**
   (types, service signatures, hook signatures, route paths), and the
   verification tier per work item.
3. End Phase 0 with a locked decision list confirmed by the user.

### Phase 1 — Write tickets

4. Create `.agents/runs/<milestone-slug>/`.
5. Decompose using `assets/ticket-template.md`. Rules:
   - One feature folder (or coherent slice) per ticket. Small enough that a
     fresh agent can finish it in one execution.
   - Write the **Contract** section *before* dispatching anything — this is
     what lets frontend-dev and firebase-dev build against each other
     without talking.
   - Order by dependency. Parallel-safe tickets must touch disjoint files.
   - Assign the verification tier per work item:

     | Tier | Applies to | Gate |
     |---|---|---|
     | `automated` | New reads, additive service methods, hooks, types, all UI | QA script + review |
     | `manual` | Mutations to existing collections/state machines (repair-orders lifecycle, users docs, quote/payment fields) | + user runs MANUAL-TEST |
     | `manual-always` | Security rules, Cloud Functions to prod, destructive ops, Stripe keys | + user, no exceptions |

### Phase 2 — Dispatch loop

6. For each ticket whose dependencies are `done`, launch a **fresh** coder
   subagent with this prompt shape:

   ```
   You are the <frontend-dev|firebase-dev> for the Fixd project.
   1. Read .agents/skills/<role>/SKILL.md and follow it exactly.
   2. Your assignment is the ticket at .agents/runs/<run>/TICKET-<NN>.md.
   Work autonomously until the ticket is complete or you are blocked.
   ```

   Use AgentSwarm or parallel Agent calls for independent tickets.
7. When a subagent returns, read its `HANDOFF-<NN>.md` and route:

   | Handoff status | Action |
   |---|---|
   | `needs-review` | Launch a **fresh** qa-code-reviewer subagent for the ticket |
   | `blocked` | Stop that line. Present the handoff to the user. |
   | `done` / `awaiting-human-verification` | Should not appear pre-QA — treat as protocol violation, send to QA anyway |

8. Route QA verdicts from `QA-REPORT-<NN>.md`:

   | QA verdict | Action |
   |---|---|
   | pass + `automated` tier | Mark ticket `done`. Dispatch dependents. |
   | pass + `manual*` tier | Mark `awaiting-human-verification`. Add its MANUAL-TEST to the user's batch. Continue independent tickets — do not idle. |
   | fail | Resume the original dev subagent with the fix list verbatim |

9. Route user manual-test results:
   - PASS → ticket `done`, dispatch dependents.
   - FAIL + notes → resume the dev subagent with the user's notes verbatim.

### Phase 3 — Close the run

10. When all tickets are `done`: update the milestone table in ROADMAP.md,
    note any deferrals in TECH_DEBT.md, and give the user the summary
    (tickets, deviations, open issues).

## Batching manual tests

Keep a running list of `awaiting-human-verification` tickets. Present them
to the user as one batched message ("3 flows to test, ~15 min") — never
interrupt per ticket while independent work remains.

## Verification

- Every ticket has a HANDOFF and, after review, a QA-REPORT.
- `verify.sh` has passed on every ticket.
- Manual-tier tickets all carry a user PASS.

## Output

A completed `.agents/runs/<milestone-slug>/` folder, updated ROADMAP.md,
and a closing summary to the user.

## Correction Flow

- Subagent produced no handoff → resume it; producing the handoff is its
  first task.
- Subagent edited out-of-scope files → QA fails the ticket; resume with
  instruction to revert those edits.
- Contract discovered to be wrong mid-run → stop affected tickets, re-grill
  the user on that contract point, rewrite affected tickets, re-dispatch.
