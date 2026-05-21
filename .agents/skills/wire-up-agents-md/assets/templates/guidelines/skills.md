# Skills

This file is the standard for authoring custom AI agent skills under `.agents/skills/`. Read this before adding a new skill.

## Directory layout

Each skill uses this shape:

```
.agents/skills/<skill-name>/
├── SKILL.md
├── scripts/
├── references/
├── assets/
└── agents/
```

Rules:

- `SKILL.md` is required.
- `scripts/`, `references/`, `assets/`, `agents/` are optional.
- Keep supporting files one level deep from `SKILL.md`.
- Use forward-slash relative paths in every reference.

## Skill boundaries

- One skill = one workflow OR one reference domain. Not both.
- Don't split a workflow into tiny command-only skills unless discovery is failing.
- Don't bundle unrelated workflows into one skill.
- Prefer project-specific terminology over generic wording.

## Frontmatter

Every `SKILL.md` must include:

```yaml
---
name: skill-name
description: Explains what the skill does, when it should trigger, and when it should not trigger.
---
```

Rules:

- `name` exactly matches the parent directory name.
- Lowercase letters, numbers, hyphens only.
- Write descriptions in third person.
- Include both positive triggers AND negative (do-not-trigger) cases.
- Keep descriptions concrete and project-specific.

## SKILL.md structure

One of two templates. Keep the section order stable.

### Workflow skill template

```md
---
name: skill-name
description: ...
---

# Skill Name

## Purpose

## Use This Skill When

## Do Not Use This Skill When

## Required Inputs

## Preconditions

## Supporting Files

## Workflow

## Verification

## Output

## Correction Flow
```

### Reference skill template

```md
---
name: skill-name
description: ...
---

# Skill Name

## Purpose

## Use This Skill When

## Do Not Use This Skill When

## Rules

## Before Finishing
```

## Content rules

- Keep `SKILL.md` lean and procedural.
- Put dense examples, schemas, or long references in `references/`.
- Put deterministic, repeatable operations in `scripts/` (Python or shell).
- Put templates or static output shapes in `assets/`.
- Prefer one default approach over a menu of alternatives.
- Use numbered steps for workflows. Use direct commands for critical sequences.
- Avoid time-sensitive instructions unless clearly marked as legacy.

## Validation checklist (before merging a new skill)

- Description is specific enough to trigger only for the intended tasks.
- Description includes a clear non-trigger case.
- Every referenced file path is correct.
- Scripts return actionable errors (no silent failures).
- The skill can be followed without guessing missing steps.

## Reference guidelines

When a skill needs rules that already exist in `guidelines/`, **reference** the guideline file. Don't duplicate the rules in the skill — that's how they drift out of sync. The skill's job is the workflow; the guideline's job is the rule.
