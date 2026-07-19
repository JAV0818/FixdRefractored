---
name: agent-handoff
description: Shared handoff contract for the Fixd agent loop. Every agent (orchestrator, frontend-dev, firebase-dev, qa-code-reviewer) writes a HANDOFF file when it finishes or gets blocked on a ticket, so the next agent — which always starts with zero context — can continue from artifacts on disk instead of conversation memory. Use at the end of every ticket execution. Do not use for direct user conversations or work outside a ticketed run.
---

# Agent Handoff

## Purpose

Subagents in the loop start with **zero context**. State therefore lives on
disk, not in any context window. This skill is the single contract every agent
uses to pass work forward.

## Use This Skill When

- You finished a ticket (pass or fail) and must report what changed.
- You are blocked and need to escalate with enough detail to resume.
- You are the orchestrator routing work based on a handoff's status.

## Do Not Use This Skill When

- Chatting directly with the user (no ticket involved).
- The work was not assigned through a ticket in `.agents/runs/`.

## Required Inputs

- The ticket file you executed (`.agents/runs/<run>/TICKET-<NN>.md`).

## Where Things Live

```
.agents/runs/<milestone-slug>/          one folder per orchestrated run
├── TICKET-<NN>.md                      written by orchestrator
├── HANDOFF-<NN>.md                     written by the executing agent
├── QA-REPORT-<NN>.md                   written by qa-code-reviewer
└── MANUAL-TEST-<NN>.md                 written by dev agent for manual-tier tickets
```

## Workflow

1. Before finishing (or stopping blocked), write
   `.agents/runs/<run>/HANDOFF-<NN>.md` using the template below.
2. Set exactly one status value.
3. Reference files by path — never paste large code blocks into the handoff.

## Status Values

| Status | Meaning | Orchestrator routes to |
|---|---|---|
| `needs-review` | Work complete, self-verified, awaiting QA | fresh qa-code-reviewer agent |
| `awaiting-human-verification` | QA passed; ticket is manual-tier | user runs MANUAL-TEST |
| `done` | Closed (automated-tier QA pass, or user PASS) | dependent tickets |
| `blocked` | Cannot proceed without a decision | user, immediately |

## Handoff Template

```md
# HANDOFF: TICKET-<NN> — <title>
Status: <needs-review | blocked>

## Changed files
- created: <paths>
- modified: <paths>

## Verified
- `<command>` → <result>. One line per acceptance criterion checked.

## Deviations
- <what differs from the ticket, and why. "none" if none.>

## Open issues
- <known gaps, edge cases not handled. "none" if none.>

## For the next agent
- <shapes, gotchas, decisions the reviewer/next ticket must know.
  Example: "useMessages returns ascending order; the view reverses it.">
```

## Rules

- A ticket execution is not finished until its HANDOFF file exists. No exceptions.
- The Contract section of a ticket is frozen. If it must change, stop and
  write `Status: blocked` with the reason — do not silently renegotiate it.
- One handoff per execution. If a ticket is resumed after QA rejection, the
  agent **overwrites** its previous handoff with the new state.

## Supporting Files

- `assets/manual-test-template.md` — template for MANUAL-TEST files on
  manual-tier tickets (both dev roles use it).

## Output

A `HANDOFF-<NN>.md` file on disk with a valid status.

## Correction Flow

Orchestrator finds a missing/invalid handoff → the executing agent is resumed
and must produce it before anything else proceeds.
