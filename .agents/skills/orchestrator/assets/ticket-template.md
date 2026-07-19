# TICKET-<NN>: <short title>

- Milestone: <MX — name> (see ROADMAP.md)
- Agent: <frontend-dev | firebase-dev>
- Depends on: <TICKET-NN | none>
- Verification: <automated | manual | manual-always>

## User story

As a <customer | provider | owner>, I want <capability>, so that <outcome>.

## Context

<What exists today that this ticket builds on. Facts with file paths,
never assumptions. 3-6 lines max.>

### Read first

- <exact file paths the agent must read before writing any code>
- best_practices.md
- guidelines/<files relevant to this ticket>.md

## Contract (orchestrator-defined — do not change)

<The interfaces both sides build against: type names and shapes, service
method signatures, hook signatures, query keys, route paths. This is what
lets frontend-dev and firebase-dev work without talking to each other.
If this section is wrong, stop and mark the ticket blocked — do not edit it.>

## In scope

- <paths this agent may create or modify>

## Out of scope

- <paths owned by other tickets or other roles>

## Acceptance criteria (pass cases)

1. <Observable behavior or checkable fact>
2. <...>
3. `npm run type-check` passes.

## Verification

- Automated: `.agents/skills/qa-code-reviewer/scripts/verify.sh`
- Manual (manual tiers only): see `MANUAL-TEST-<NN>.md`

## Upstream handoff notes

<Orchestrator pastes the "For the next agent" sections of dependency HANDOFFs
here. "none" if no dependencies.>
