# AGENTS.md — Fixd

This file is the **index**. It tells any AI agent (or new teammate) where the rules live. The rules themselves are in `best_practices.md` and `guidelines/`. Read those before changing code.

## Before coding

1. Read `best_practices.md` at the repo root. It's the source of truth for stack choices, naming, and high-level conventions.
2. For the area you're touching, read the matching guideline file in `guidelines/`:
   - Building a UI primitive → `guidelines/components.md`
   - Building a screen → `guidelines/views.md` and `guidelines/architecture.md`
   - Writing a hook → `guidelines/hooks.md`
   - Choosing where state goes → `guidelines/state.md`
   - Adding or modifying a route → `guidelines/navigation.md`
   - Anything visual → `guidelines/styling.md`
3. If a custom skill applies to your task, the `.agents/skills/<skill-name>/SKILL.md` files document them. (None ship by default — students add skills as they grow the codebase.)

## Architecture in one diagram

```
src/page/<feature>/
├── <name>.page.tsx                composition only — no logic, no data
├── views/
│   ├── <name>.view.tsx            the switch (loading / error / success)
│   ├── <name>-success.view.tsx    renders the data, handles empty inline
│   ├── <name>-loading.view.tsx    skeleton
│   └── <name>-error.view.tsx      error UI + retry
├── components/                    dumb presentational (props in, events out)
├── hooks/                         use-*.ts (React Query, Context consumers)
├── interfaces/                    types
├── utils/                         pure transforms, no React
└── <feature>.constants.ts         copy, defaults
```

The `.page.tsx` file delegates to a switch `.view.tsx`. The switch consumes hooks and delegates to one of three sibling views (success, loading, error). The success view renders the data and handles its own empty case inline. **Hooks own logic. Views own decisions. Components own pixels.**

For the long-form rationale, see `guidelines/architecture.md`.

## Navigation

Routes live in `app/`, using Expo Router's file-system conventions. Route files are thin re-exports of pages — they import from `src/page/<feature>/<name>.page.tsx` and export it as default. The root `app/_layout.tsx` ships with an **auth gate** that redirects between `(auth)` and `(tabs)` based on the signed-in user.

For routing patterns, navigation helpers, and the recipe for adding a new screen, see `guidelines/navigation.md`.

## Single source of truth

`guidelines/` is the canonical location for all rules. AGENTS.md, the README, and any custom skills should **reference** these files, not duplicate them. When you add a rule, add it to `guidelines/` and link from here.

## Conventions at a glance

- **File names**: kebab-case with suffix (`habit-card.component.tsx`, `use-sign-in.ts`).
- **Hooks**: `use-*.ts` (kebab).
- **Types/interfaces**: PascalCase. Colocated in `<feature>/interfaces/` or sibling `.interface.ts` files.
- **TypeScript**: strict, no `any`. Use `type` for object shapes.
- **State priority**: React Query (server) → React Context (client) → Zustand (only when Context isn't enough).
- **Styling**: theme tokens only. Never hardcode colors, spacing, or font sizes.
- **Navigation**: `<Link>` for user actions, `router.replace` for redirects (so back-button can't reach disallowed screens).

## When in doubt

Stay consistent with the existing pattern. Find the closest similar feature in the codebase, copy its structure, then adapt. The architecture is more important than any individual file.
