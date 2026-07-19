---
name: build-performant-component
description: Generates a themed, properly-memoized React Native component for the Fixd project. Trigger on phrases like "add a component", "build a card", "create a list-item", "make a button variant", or "I need an XCard component". Enforces kebab-case naming with .component.tsx suffix, inline props type for feature-scoped components (sibling .interface.ts only for app-wide reusables in src/components/), theme tokens only, Paper primitives, memo by default per guidelines/components.md with two documented skip-cases, and static const styles. Do NOT use for data-fetching (use data-hook-firebase), full screens (extend a feature folder), or modifying existing components.
---

# build-performant-component

Generate a single dumb React Native component that matches the project's
component rules — kebab-case, suffixed, props placed by scope, theme tokens
only, no data fetching, no load-bearing state.

## What this skill produces

**Feature-scoped** example (`src/page/habits/components/`):

```
src/page/habits/components/
├── habit-card.component.tsx     ← inline props type, memo(function HabitCard(...))
└── index.ts                     ← updated re-exports
```

**App-wide** example (`src/components/`):

```
src/components/
├── habit-card.component.tsx
├── habit-card.interface.ts      ← props type, separated because it's a public contract
└── index.ts
```

The scaffold script auto-detects the location:
- Path contains `src/page/<feature>/components/` → inline props.
- Path is `src/components/` (or below) → sibling `.interface.ts`.

Override with `--props-style inline` or `--props-style sibling` if the
auto-detection is wrong.

## When to use this skill

The user is building a presentational piece. Examples:

- "Add a `HabitCard` component to the habits feature"
- "Create a streak badge that shows a number with a flame icon"
- "I need a list item for the dashboard"
- "Make a small empty-state component that takes a title and a body"

Don't use this skill if:

- The component needs to fetch data → use `data-hook-firebase`.
- The user wants to set up a new screen / feature → extend the feature folder
  directly (page/view/component) instead.
- The user wants to modify an existing component → just edit it directly.

## How to use this skill

The skill is interactive. Walk the user through a short interview, then run
the scaffold script.

### Step 1 — Gather the answers

You need five things. If the user supplied any in their initial prompt, don't
re-ask — confirm what you have.

1. **Component name?** (PascalCase, e.g., `HabitCard`)
   The exported identifier. The file name will be the kebab-cased version
   (`habit-card`).

2. **Target folder?** (absolute or relative path)
   - Feature-scoped: `src/page/<feature>/components/` — default; use when
     only one feature uses it.
   - App-wide: `src/components/` — rare; only when genuinely reused across
     features.

3. **Short description of what it renders?** (one sentence)
   Goes in a top-of-file comment.

4. **Props?** (free-form)
   Infer:
   - A TS type body (e.g., `title: string;\n  count: number;\n  onPress: () => void;`).
   - A comma-separated list of prop names for destructuring
     (e.g., `title, count, onPress`).

5. **Wrap in `React.memo`?** (default: yes)
   Default to **yes** — `guidelines/components.md` makes `memo` the default
   for presentational components. Answer no only for the guideline's two
   skip cases: a page/screen rendered once, or a component that always
   receives new props (e.g. `children`, inline objects).

   When invoked inside the agent loop (frontend-dev/firebase-dev subagent),
   there is no user to interview: take every answer from the ticket and run
   the script directly.

### Step 2 — Confirm

Echo back a short summary and ask the user to confirm:

> About to generate:
> - **Component**: HabitCard
> - **File**: `src/page/habits/components/habit-card.component.tsx`
> - **Props style**: inline (feature-scoped)
> - **Props**: `title: string; count: number; onPress: () => void;`
> - **memo**: yes
>
> Run it? (y / change something)

### Step 3 — Run the scaffold script

```bash
python <path-to-skill>/scripts/scaffold.py \
  --name "HabitCard" \
  --location "src/page/habits/components" \
  --description "A card showing a habit name and its current streak count." \
  --props-type "title: string;
  count: number;
  onPress: () => void;" \
  --prop-names "title, count, onPress"
```

Flags:
- `--props-type` is the body of the TS type (lines between `{` and `}`).
- `--prop-names` is comma-separated, used for destructuring.
- `--memo no` opts out of memo only for a guideline skip-case.
- `--props-style inline|sibling` overrides the auto-detection.
- If the target folder doesn't exist, the script errors.

### Step 4 — Show next steps

After the script reports success:

> Generated:
> - `src/page/habits/components/habit-card.component.tsx`
> - Updated: `src/page/habits/components/index.ts`
> - (`.interface.ts` only for app-wide output)
>
> **Next steps**
> 1. Import it where you need it: `import { HabitCard } from "@/page/habits/components"`.
> 2. Pass real props from your view.
> 3. If the styles grow past ~30 lines, extract them to a sibling
>    `habit-card.styles.ts`.

## Rules this skill enforces

Every generated component follows `guidelines/components.md`:

- **kebab-case file name** with `.component.tsx` suffix.
- **Props placement by scope**: inline at the top of the component file for
  feature-scoped components; sibling `.interface.ts` only for app-wide
  reusables in `src/components/`. Type name is `<ComponentName>Props`. The
  script auto-detects this from the target path.
- **PascalCase export** matching the file's PascalCase identifier.
- **Theme tokens only** — imports `colors`, `spacing`, `typography`, `radii`
  from `@/theme` and references them by name. Never literal values.
- **React Native Paper components** as the default UI primitives.
- **No data fetching imports.** No `services/`, no `firebase`, no React Query.
- **No load-bearing state.** Local `useState` for UI flags is allowed.
- **`memo` by default** — the script wraps with
  `memo(function Name(...) { … })` unless you pass `--memo no` for a
  guideline skip-case. Static style `const`s are extracted above the
  component so `memo`'s shallow compare actually wins.

If the user asks why a rule is enforced, load
`references/components-rules.md` for the long answer.

## Reference files

- `references/components-rules.md` — Long-form explanation of why each rule
  exists, with examples of right-and-wrong implementations.
