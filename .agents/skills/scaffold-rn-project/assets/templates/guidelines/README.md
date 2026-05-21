# Guidelines

This directory is the **single source of truth** for all rules, recommendations, and coding standards in this project.

It exists so the same rules don't get scattered across tool-specific config files and individual SKILL.md files. Shared agent guidance lives in `AGENTS.md` and references this folder; reusable workflows live in `.agents/skills/` and also reference this folder. Both reference the rules; neither duplicates them.

## Files in this directory

| File | Purpose |
|---|---|
| `architecture.md` | The feature-scoped 3-tier hierarchy. The spine of the codebase. |
| `state.md` | State management priority: React Query → Context → Zustand. |
| `components.md` | Rules for `.component.tsx` files. Dumb presentational only. |
| `views.md` | Rules for `.view.tsx` files. The 3-state switch + success pattern. |
| `hooks.md` | Rules for `use-*.ts` files. React Query and Context consumers. |
| `navigation.md` | Expo Router conventions, the auth gate, how to add a new screen. |
| `styling.md` | Theme tokens, no hardcoded literals. Paper-first. |
| `skills.md` | Standard for authoring custom skills under `.agents/skills/`. |

## How agents consume these guidelines

`AGENTS.md` and any file under `.agents/skills/` should **reference** files in this directory rather than copying their contents. When a rule changes, it changes in exactly one place.

## Adding new guidelines

1. Create a new `.md` file in this directory (or a subdirectory like `guidelines/ui/` for narrow concerns).
2. Update this README's table.
3. Update `AGENTS.md` or the relevant skill file to reference the new guideline.
