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

See `guidelines/styling.md`.

## TypeScript discipline

- Strict mode is on. No `noUnusedLocals`/`noUnusedParameters` flexibility — we accept linter warnings for those.
- Prefer `type` over `interface` for object shapes.
- Use `import type { Foo }` for type-only imports.
- No `any` without a comment.

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
