# Architecture

This project uses a **feature-scoped 3-tier hierarchy**. Every feature owns one folder; that folder contains everything for the feature. The three tiers are page (composition), view (decisions), component (pixels). Read this file first when you join the project.

## The folder layout

```
src/page/<feature>/
├── <feature>.page.tsx           composition only
├── <feature>.constants.ts       copy, defaults, labels
├── index.ts                     re-exports the page
├── views/
│   ├── <feature>.view.tsx       the switch (loading / error / success)
│   ├── <feature>-success.view.tsx  renders the data (handles empty inline)
│   ├── <feature>-loading.view.tsx  skeleton matching the success layout
│   └── <feature>-error.view.tsx    error UI + retry
├── components/
│   ├── <name>.component.tsx
│   ├── <name>.interface.ts      props type
│   └── index.ts                 re-exports
├── hooks/
│   └── use-<name>.ts            React Query, Context consumers
├── interfaces/                  feature-scoped types
└── utils/                       pure transforms, no React
```

## The three tiers

### Page (`*.page.tsx`)

The composition tier. The page assembles the screen — wraps children in providers, layouts, error boundaries, safe-area views. The page does **not**:
- Call hooks (other than React itself: useState, useMemo for layout)
- Fetch data
- Decide UI variants

A page should be small (~10–40 lines) and read like a recipe.

### View (`*.view.tsx`)

The decisions tier. The primary `<feature>.view.tsx` is **the switch** — it consumes hooks, looks at loading / error / data, and delegates to one of three sibling files:

```tsx
const HabitsView = () => {
  const { data, isLoading, isError, error, refetch } = useHabits();

  if (isLoading) return <HabitsLoadingView />;
  if (isError) return <HabitsErrorView error={error} onRetry={refetch} />;
  return <HabitsSuccessView habits={data ?? []} />;
};
```

The success view receives the data and decides internally whether to render the list or the empty-state UI. **Empty is a sub-state of success, not a peer of loading/error.** See `guidelines/views.md` for the rationale.

### Component (`*.component.tsx`)

The pixels tier. Components take props, return JSX. They:
- Never fetch data.
- Never call services.
- Never own load-bearing state.
- Reference theme tokens; never hardcode literals.

If you delete a component and drop it into another project with the same prop shape, it works.

## Role-aware screens

Some screens are **shared across roles** (e.g. an order detail seen by both a customer and a provider). The body of the screen is usually identical; only the actions and the hooks behind them differ per role.

Split each role's actions into its **own view-tier file** that mounts **only that role's hooks and side-effects**. The shared success view renders the common layout and picks the role piece:

```tsx
// order-detail-success.view.tsx — shared layout, one-line role pick
{role === "customer" && <CustomerActions order={order} />}
{role === "provider" && <ProviderActions order={order} />}
```

```
views/
├── <feature>-success.view.tsx           shared layout + role pick
├── <feature>-customer-actions.view.tsx  customer hooks + side-effects only
└── <feature>-provider-actions.view.tsx  provider hooks + side-effects only
```

These per-role files are **views, not components** — they own hooks (`useApproveQuote`, `useAcceptOrder`), local UI state (a date picker), and side-effects (a confirm `Alert`). Anything dumb they share (a passive status pill) stays a real component (`status-hint.component.tsx`).

Do **not** fork the whole screen into `customer/` and `provider/` subfolders — that duplicates the shared layout. Only the diverging actions get split.

## Naming

| Kind | Pattern | Example |
|---|---|---|
| Page | `<feature>.page.tsx` | `sign-in.page.tsx` |
| View (switch) | `<feature>.view.tsx` | `habits.view.tsx` |
| View (variant) | `<feature>-<state>.view.tsx` | `habits-success.view.tsx`, `habits-loading.view.tsx` |
| Component | `<name>.component.tsx` | `auth-button.component.tsx` |
| Component props | `<name>.interface.ts` | `auth-button.interface.ts` |
| Hook | `use-<name>.ts` | `use-sign-in.ts` |
| Constants | `<feature>.constants.ts` | `auth.constants.ts` |

## Why this layout

**One job per file.** Anyone reading a path can predict what's inside.

**Features are self-contained.** Delete a feature = delete one folder. Move a feature = move one folder. No surgery across multiple top-level folders.

**Refactors are local.** Swap Firebase for Supabase? Only `src/services/` changes. Re-skin the UI? Only components and `theme/` change. The blast radius of any change is bounded by the layer it lives in.

**Tests follow the structure.** A hook test mocks its service. A component test renders with synthetic props. A view-switch test sets up hook return values and asserts which sibling rendered. A success-view test passes a known-shape data array. No layer's tests have to care about other layers' internals.

## Anti-patterns

- **A `.component.tsx` that imports from `services/` or `firebase`.** Push data into props via a hook and have the success view pass it down.
- **The switch view rendering JSX of its own.** The switch's only job is choosing which sibling to render. UI belongs in the variant files.
- **A separate `<feature>-empty.view.tsx`.** Empty is a sub-state of success — handle it inside `<feature>-success.view.tsx`.
- **A flat `src/hooks/` dump.** Hooks belong inside the feature that owns them. App-wide hooks (`use-theme`, `use-auth-context`) live in `src/hooks/`; feature hooks live in `src/page/<feature>/hooks/`.
- **A page file with `useState` or `useEffect`.** That's a view's job.
- **One view branching on `role` that mounts every role's hooks.** A customer screen must not instantiate provider-only mutations (and vice-versa) — even though unused mutation hooks don't fetch, it leaks each role's logic into the other. Split per-role actions into their own view files (see *Role-aware screens*).
