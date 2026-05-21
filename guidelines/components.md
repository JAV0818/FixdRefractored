# Components

A component in this codebase is **dumb** by construction. Props in, JSX out.

## Rules

- **No data fetching.** Never import from `services/`, `firebase/*`, or React Query.
- **No load-bearing state.** Local UI state is fine (a `useState` for "is this dropdown open"). Anything that matters comes in as props.
- **No decisions about what to fetch.** That's a view's job.
- **Theme tokens only.** Reference `colors.primary`, `spacing.md`, `typography.title` — never `"#3478F6"`, `16`, `{ fontSize: 22 }`.
- **One job per component.** If the name has "and" in it, you have two components.
- **Default to `memo`.** Components in `components/` folders are usually rendered in lists or re-render frequently. `memo` is cheap insurance.
- **Static style/sx objects extracted as `const` above the component**, never built inline in JSX. Inline objects create a new reference on every render and break `memo`'s prop comparison.

## File layout

For a **feature-scoped** component (the 99% case — lives inside `src/page/<feature>/components/`):

```
src/page/<feature>/components/
  <name>.component.tsx         the component, with props type inline at top
  index.ts                     re-exports the component
```

For an **app-wide** component (the deliberate exception — lives inside `src/components/<name>/`):

```
src/components/<name>/
  <name>.component.tsx         imports the props type from sibling
  <name>.interface.ts          the props type, separated because the
                               component is meant to be reused and the type
                               is part of its public contract
  index.ts                     re-exports both
```

Why the split? Feature-scoped components are owned by one feature and rarely referenced from outside. Their props can change with the component without ceremony — inline keeps the type next to the only file that uses it. App-wide components are shared infrastructure; their props are a contract, and a contract deserves its own file so consumers can `import type { FooProps }` without dragging in the component.

## Anatomy of a component (inline-props style)

```tsx
// habit-card.component.tsx
import { memo } from "react";
import { Card, Text } from "react-native-paper";

import { colors, spacing } from "@/theme";

const containerStyle = { margin: spacing.md, padding: spacing.md };
const titleStyle = { color: colors.textPrimary };

type HabitCardProps = {
  title: string;
  count: number;
  onPress: () => void;
};

export const HabitCard = memo(function HabitCard({
  title,
  count,
  onPress,
}: HabitCardProps) {
  return (
    <Card mode="contained" style={containerStyle} onPress={onPress}>
      <Card.Content>
        <Text variant="titleMedium" style={titleStyle}>
          {title}
        </Text>
        <Text variant="bodyMedium">{count}-day streak</Text>
      </Card.Content>
    </Card>
  );
});
```

Things to notice:

- **Props type is right above the component**, in the same file. Reader scrolls 5 lines to see what comes in.
- **`memo(function HabitCard(...) { ... })`** — the inner function is named (not anonymous) so React DevTools and stack traces show `HabitCard`, not `Anonymous`. The outer `memo()` wraps it.
- **Static style consts are declared above the component**. They are referenced by `style={containerStyle}` inside JSX, never inlined as `style={{ margin: 16 }}`.

## Naming

- Component file: `<name>.component.tsx` (kebab + suffix).
- Sibling type file (app-wide only): `<name>.interface.ts`.
- The exported component is **PascalCase** matching the file's PascalCase identifier.
- Props type: `<ComponentName>Props`.

## When NOT to `memo`

The default is `memo`, but skip it when:

- The component is a **top-level page/screen wrapper** rendered exactly once per route. Wrapping it in `memo` is wasted comparison work.
- The component **always receives different props on every render** (e.g., a new object literal). `memo` would do a shallow comparison, find no equality, re-render anyway.

When in doubt, `memo`. It's cheap.

## `useCallback` in the parent

`useCallback` is meaningful **only when the consumer is wrapped in `memo`**. Without that, the child re-renders every time the parent does — memoizing the callback in the parent does nothing useful. The two go together. Alone, `useCallback` is noise.

## Anti-patterns

- **Component imports from `services/` or `firebase`.** Lift the data into a hook in the view; pass it as props.
- **Component does its own data fetching with `useEffect`.** Same fix.
- **Component hardcodes `"#3478F6"`.** Use `colors.primary`.
- **Inline `style={{ padding: 16 }}` in JSX.** Move to a `const` above the component. The inline object breaks `memo` because it creates a new reference each render.
- **Anonymous function inside `memo`.** `memo(function Name(...) {})` gives you good stack traces; `memo((props) => ...)` gives you "Anonymous".
