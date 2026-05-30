# Best practices — Fixd

This file is the project's high-level rules. Detailed per-area rules live in `guidelines/`. AGENTS.md is the index.

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Runtime | Expo SDK 54 | Phone's Expo Go must match this SDK. |
| Navigation | Expo Router | File-system-based, models Next.js App Router. |
| Language | TypeScript strict | No `any` without a one-line comment justifying it. |
| Server state | React Query (`@tanstack/react-query`) | **Required**. Never use raw `fetch`/`useEffect` for HTTP. |
| Client state | React Context | First choice for sharing client state across a subtree. |
| Client state (advanced) | Zustand (`+ immer`) | Add only when Context becomes insufficient — complex actions, perf-sensitive selectors, vanilla stores. Not in the default scaffold. |
| UI | React Native Paper | Material Design 3, themed with this app's tokens. |
| Forms | React Hook Form + Zod | Validation lives in Zod schemas. |
| Backend | Firebase | Auth + Firestore. Single init in `src/services/firebase.ts`. |

## File naming

- All files and folders: **kebab-case**.
- React components: `<name>.component.tsx` + optional `<name>.interface.ts`.
- Screens / pages: `<name>.page.tsx` (composition) and `<name>.view.tsx` (logic + decisions).
- Hooks: `use-<name>.ts`. No JSX in hooks.
- Types/interfaces: `<name>.interface.ts` files (or colocated `<feature>/interfaces/` folder).
- Constants: `<feature>.constants.ts`.

## Architecture — the three tiers

```
src/page/<feature>/
├── <name>.page.tsx          composition only
├── views/<name>.view.tsx    data fetching + decisions
└── components/<name>.component.tsx   dumb presentational
```

- **Page**: composes the screen. Wraps in providers/layouts/error boundaries. No state. No fetching.
- **View**: calls hooks, decides which UI variant to render based on the hook's state. Renders components.
- **Component**: takes props, returns JSX. Never fetches data. Never imports services. Reference theme tokens.

See `guidelines/architecture.md` for the long version.

## Use the skills

`.agents/skills/` holds skills that bake in these conventions (naming, `memo`,
theme tokens, the data-layer split). When a task matches one, **invoke it**
instead of hand-rolling:

| Task | Skill |
|---|---|
| New presentational component | `build-performant-component` |
| New Firestore data hook (service + query/mutation) | `data-hook-firebase` |
| New screen / feature scaffold | `scaffold-rn-project` (fresh app) or extend a feature folder |

Caveat: these skills are *interactive* (they interview you), so for a small
component added mid-feature it is often faster to follow the rules inline — which
is exactly why the conventions also live in this file, not only in the skill.

## Navigation

Routes live in `app/`, using Expo Router (file-system-based routing — same model as Next.js App Router). Route files re-export pages from `src/page/<feature>/<name>.page.tsx`. The root `_layout.tsx` enforces an auth gate that redirects between `(auth)` and `(tabs)` based on the signed-in user.

See `guidelines/navigation.md`.


## State management priority

1. **React Query** for all HTTP data.
2. **React Context** for client state local to a feature or shared across a subtree.
3. **Zustand** only when Context isn't enough.

See `guidelines/state.md`.

## Styling

- Theme tokens (`@/theme`) only. **Never** hardcode colors, spacing, font sizes, radii.
- Paper components first, falling back to RN primitives wrapped in styled `<View>`.
- One `<name>.styles.ts` per component (when styles are non-trivial).

### Shared UI primitives — use these, never re-style

If you find yourself setting `mode`, `buttonColor`, `textColor`, `outlineColor`,
or a `backgroundColor: colors.surface` + radius + padding on a Paper primitive
**inline**, stop — use the shared primitive below instead. A primitive's look
lives in **one** place so it can't drift between screens (the reason the
customer's Decline and the provider's Cancel once looked different).

| Need | Use (`@/components`) | Variants / notes |
|---|---|---|
| Button | `AppButton` | `variant`: `primary` \| `secondary` \| `danger` |
| Text field | `AppTextInput` | outlined + brand colors; optional `error` string |
| Card / surface | `AppCard` | white surface + radius + padding |
| Date + time picker | `DateTimeField` | |
| Order status pill | `OrderStatusBadge` | |
| Order list row | `OrderListItem` | |

Need a new look? **Add a variant** to the primitive (e.g. a new `AppButton`
variant) rather than overriding its props at the call site. Feature-scoped
wrappers (e.g. `FormTextField` binding RHF) should wrap the shared primitive,
not re-implement its styling.

See `guidelines/styling.md`.

## Re-render discipline

Full rules in `guidelines/components.md`; the essentials, because they're easy to
miss when a component is hand-written mid-feature:

- **`memo` presentational `*.component.tsx` by default** — especially anything
  rendered in a list / `.map`, or whose parent re-renders often (e.g. a screen
  driven by a live Firestore listener). Name the inner fn: `memo(function Foo(props) { … })`.
- **Skip `memo`** for a page/screen rendered once, **or** a component that always
  receives new props (e.g. `children`, an inline object, an inline `onPress`) —
  `memo` would compare, find them unequal, and re-render anyway. (That's why the
  `AppButton` / `AppCard` wrappers that take `children` are deliberately *not* memo'd.)
- **`useCallback` only pairs with a `memo`'d child** — otherwise it's noise.
- **`useMemo` for expensive derived data** (filter/sort/map large arrays), not
  cheap scalars or strings.
- **No inline `style={{…}}` / objects in JSX** — declare a `const` above the
  component or use `StyleSheet.create`. Inline objects get a new reference each
  render and break a child's `memo`.
- **Pure helpers that don't close over props/state → module-level functions**,
  not redefined inside the component.

Quick pre-merge check: `find src -name '*.component.tsx'` and eyeball any without
`memo` against the "skip" cases above.

## TypeScript discipline

- Strict mode is on. No `noUnusedLocals`/`noUnusedParameters` flexibility — we accept linter warnings for those.
- Prefer `type` over `interface` for object shapes.
- Use `import type { Foo }` for type-only imports.
- No `any` without a comment.
- **Order object-type members alphabetically.** For small/flat types, sort every member A–Z. For large domain types, keep the labeled logical groups (e.g. `RepairOrder`'s Parties / Pricing / Timestamps) and sort members A–Z *within* each group. A new field goes in its alphabetical slot — never appended to the end.

## Imports

Order: external → workspace → internal, separated by blank lines.

```tsx
import { useState } from "react";
import { View } from "react-native";

import { Button } from "react-native-paper";

import { useSignIn } from "@/page/auth/hooks/use-sign-in";

import { AuthInput } from "./components/auth-input.component";
```

## When in doubt

Stay consistent with the existing pattern. Find a similar feature, copy its shape, adapt.
