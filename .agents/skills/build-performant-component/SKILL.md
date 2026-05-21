---
name: build-performant-component
description: Generates a themed, properly-memoized React Native component (.component.tsx plus optional sibling .interface.ts) for The Cooked Dev Course projects. Trigger on phrases like "add a component", "build a card", "create a list-item", "make a button variant", "I need an XCard component", or any request to add a UI primitive that takes props and renders JSX. Enforces kebab-case naming with .component.tsx suffix, inline props type for feature-scoped components (sibling .interface.ts only for app-wide reusables in src/components/), theme tokens only (no hardcoded colors or spacing), Paper primitives where possible, and optional memo wrapping for components that render inside lists. Do NOT use for: data-fetching (use data-hook-firebase), full screens (use scaffold-rn-project or extend a feature folder), or modifying existing components.
---

# build-performant-component

Generate a single dumb React Native component that matches the architecture's component rules — kebab-case, suffixed, props typed in a sibling `.interface.ts`, theme tokens only, no data fetching, no state that matters. The result is a file pair students can drop straight into an existing feature folder or the app-wide `src/components/` folder.

## What this skill produces

For a component named `HabitCard` targeting `src/page/habits/components/`:

```
src/page/habits/components/
├── habit-card.component.tsx     ← the component (theme tokens, Paper primitives)
├── habit-card.interface.ts      ← the props type
└── index.ts                     ← updated re-exports (or created if missing)
```

The script writes the two new files and either creates or updates the parent `index.ts` to re-export them.

## When to use this skill

The user is building a presentational piece. They want something that takes props and returns JSX. Examples:

- "Add a `HabitCard` component to the habits feature"
- "Create a streak badge that shows a number with a flame icon"
- "I need a list item for the dashboard"
- "Make a small empty-state component that takes a title and a body"

Don't use this skill if:

- The component needs to fetch data → use `data-hook-firebase` to make the hook and have a view consume it.
- The user wants to set up a new screen / feature → use `scaffold-rn-project` (for a fresh project) or have them add a `<feature>.page.tsx` + view + this skill for the components separately.
- The user wants to modify an existing component → just edit it directly.

## How to use this skill

The skill is interactive. Walk the user through a short interview, then run the scaffold script.

### Step 1 — Gather the answers

You need five things. If the user supplied any in their initial prompt, don't re-ask — confirm what you have.

1. **Component name?** (PascalCase, e.g., `HabitCard`)
   The exported identifier. The file name will be the kebab-cased version (`habit-card`).

2. **Target folder?** (absolute or relative path)
   Where the component lives. Two common patterns:
   - Feature-scoped: `src/page/<feature>/components/` — use this when the component is only used inside one feature.
   - App-wide: `src/components/` — use this when the component is genuinely reusable across features (rare; default to feature-scoped first).

   If the user doesn't specify, ask which feature folder. If they say "shared" or "global", use `src/components/`.

3. **Short description of what it renders?** (one sentence)
   This goes in a top-of-file comment so a reviewer or AI agent can tell what the component does at a glance. Example: *"A card showing a habit name and its current streak count."*

4. **Props?** (free-form)
   Ask the user to list the props as natural language. From their answer, infer:
   - A TS type body for the props (e.g., `title: string;\n  count: number;\n  onPress: () => void;`).
   - A comma-separated list of prop names for destructuring (e.g., `title, count, onPress`).

   If the user gave a prop in the form `"label: string"`, take it as-is. If they said something like "title, count, and a press handler", infer reasonable types: `title: string;`, `count: number;`, `onPress: () => void;`.

5. **Wrap in `React.memo`?** (default: no)
   Default to **no**. Suggest yes only if:
   - The component will be rendered in a list of more than ~20 items.
   - Its parent is known to re-render often with unchanged props.
   - The render is non-trivial (does meaningful work in JSX).

   When in doubt, no. Memo without a reason is noise.

### Step 2 — Confirm

Echo back a short summary and ask the user to confirm:

> About to generate:
> - **Component**: HabitCard
> - **File**: `src/page/habits/components/habit-card.component.tsx`
> - **Props**: `title: string; count: number; onPress: () => void;`
> - **memo**: no
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
  --prop-names "title, count, onPress" \
  --memo no
```

Notes:
- `--props-type` is the body of the TS type (the lines that go between `{` and `}`). The script wraps it.
- `--prop-names` is comma-separated, used for the destructuring in the component.
- `--memo yes` wraps the component in `React.memo(...)`.
- If the target folder doesn't exist, the script errors (it's not a fresh-project scaffold; the user should have a project already).

### Step 4 — Show next steps

After the script reports success:

> Generated:
> - `src/page/habits/components/habit-card.component.tsx`
> - `src/page/habits/components/habit-card.interface.ts`
> - Updated: `src/page/habits/components/index.ts`
>
> **Next steps**
> 1. Import it where you need it: `import { HabitCard } from "@/page/habits/components"`.
> 2. Pass real props from your view.
> 3. If the styles grow past ~30 lines, extract them to a sibling `habit-card.styles.ts`.

## Rules this skill enforces

Every generated component follows the rules from `guidelines/components.md`:

- **kebab-case file name** with `.component.tsx` suffix.
- **Props typed in a sibling `.interface.ts`** file. Type name is `<ComponentName>Props`.
- **PascalCase export** matching the file's PascalCase identifier.
- **Theme tokens only** — the template imports `colors`, `spacing`, `typography`, `radii` from `@/theme` and references them by name. Never literal values.
- **React Native Paper components** as the default UI primitives (`Card`, `Text`, `Button`, `Pressable` etc.).
- **No data fetching imports.** No `services/`, no `firebase`, no React Query.
- **No load-bearing state.** Local `useState` for UI flags is allowed; anything else comes via props.
- **`React.memo` only when justified.** The default is unmemoized; the `--memo yes` flag wraps in memo.

If the user asks why a rule is enforced, load `references/components-rules.md` for the long answer.

## Reference files

- `references/components-rules.md` — Long-form explanation of why each rule exists, with examples of right-and-wrong implementations.