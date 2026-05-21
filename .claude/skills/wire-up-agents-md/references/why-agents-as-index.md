# Reference: why AGENTS.md is an index, not a doc

Load this when the user asks "why this layout?" or "why not just put rules in AGENTS.md directly?"

## The principle

AGENTS.md is the **index**. The rules live in `guidelines/`. Every consumer (AGENTS.md itself, custom skills under `.agents/skills/`, per-file READMEs, your editor's onboarding doc) references those guideline files. None of them duplicate the rules.

## Why an index, not a single big doc

Three reasons.

**1. The rules need to be referenced from multiple places.** AGENTS.md references them. A custom skill in `.agents/skills/widget-mapping/SKILL.md` references them. A new teammate's onboarding doc might reference them. If the rules live in AGENTS.md, every consumer copies the relevant section. Within a month, the copies have drifted.

**2. Agents have context budgets.** AGENTS.md gets pulled into every agent invocation. If it's a 4,000-word manifesto, that's 4,000 words of context the agent loads whether or not the task touches those rules. An index that says "for navigation rules, read `guidelines/navigation.md`" lets the agent load only what's relevant.

**3. Rules change. Indexes don't.** When the component pattern changes from sibling `.interface.ts` to inline props, you edit `guidelines/components.md` once. AGENTS.md still says "for component rules, read `guidelines/components.md`" — no change needed. Same for every skill referencing the rule. The single source of truth means a single edit.

## The Gather pattern this is modeled on

In AutoNation's Gather marketplace repo, the `.claude/worktrees/feat+react-query-skills/` branch is prepping this exact structure. Their `guidelines/README.md` opens with:

> This directory is this repo's **single source of truth** for all rules, recommendations, and coding standards.
>
> It exists to avoid having the same rules scattered across tool-specific config files. Shared agent guidance belongs in `AGENTS.md`, reusable workflows belong in `.agents/skills/`, and both should reference `guidelines/` instead of duplicating rules.

And:

> `AGENTS.md` and files in `.agents/skills/` should reference the relevant files in this directory instead of copying their contents.

That's the rule this skill enforces by construction: the generated AGENTS.md is short, references `guidelines/`, and never inlines a rule that lives in a guideline file.

## What goes where

| File | Job |
|---|---|
| `AGENTS.md` | Index. "If you're touching X, read `guidelines/X.md`." That's it. |
| `best_practices.md` | Project-level summary — stack table, naming summary, the "before coding" checklist. Concise. |
| `guidelines/<topic>.md` | The actual rules. Long-form, opinionated, with code examples. One file per topic. |
| `guidelines/skills.md` | Meta — the standard for authoring custom skills. Referenced by every skill in `.agents/skills/`. |
| `.agents/skills/<name>/SKILL.md` | A custom workflow. References `guidelines/` for rules, never duplicates. |

## Anti-patterns this layout prevents

- **AGENTS.md as a 5,000-word doc.** Loads on every agent call. Wastes context. Goes stale.
- **Per-skill duplicated rules.** Three skills, three copies of "components are dumb." First time the rule changes, two of those copies become wrong.
- **Editor-specific config files with rules.** Vim's `coc-settings`, Cursor's `.cursorrules`, Claude's `CLAUDE.md` — if each of these contains rules, no single edit can update them all. The fix is to have ONE source (`guidelines/`) and have each editor's config file POINT at it.
