# Reference: the architecture this skill enforces

Load this file when the user asks "why is this structured this way?", "what's the difference between a page and a view?", "where should I put this code?" — anything that's a question about the architectural choices baked into the V2 scaffold.

## The feature-scoped 3-tier hierarchy

Every file in a generated project belongs to a **feature**, and every file has one of three jobs: composition (page), decisions (view), or pixels (component). Plus supporting files (hooks, interfaces, utils) colocated inside the feature.

### Folder shape (the template)

```
src/page/<feature>/
├── <feature>.page.tsx           composition only
├── <feature>.constants.ts       copy, labels, defaults
├── index.ts                     re-exports the page
├── views/
│   ├── <feature>.view.tsx       the switch (loading / error / success)
│   ├── <feature>-success.view.tsx  renders the data (handles empty inline)
│   ├── <feature>-loading.view.tsx  skeleton matching the success layout
│   └── <feature>-error.view.tsx    error UI + retry
├── components/
│   ├── <name>.component.tsx
│   ├── <name>.interface.ts      props type
│   └── index.ts
├── hooks/
│   └── use-<name>.ts            React Query, Context consumers
├── interfaces/                  feature-scoped types
└── utils/                       pure transforms, no React
```

### Worked example 1 — a "habits" feature (list + toggle)

A daily-habit tracker. One screen, one feature. The user sees a list of habits, taps a habit to mark today complete, sees a streak counter on each row.

```
src/page/habits/
├── habits.page.tsx                 wraps the screen in <SafeAreaView>
├── habits.constants.ts             { title: "Your habits", emptyCta: "Add your first habit" }
├── index.ts                        export { HabitsPage }
├── views/
│   ├── habits.view.tsx             the switch: useHabits() → loading / error / success
│   ├── habits-success.view.tsx     renders the list; renders empty CTA if habits.length === 0
│   ├── habits-loading.view.tsx     skeleton matching the list layout
│   ├── habits-error.view.tsx       error message + <Button onPress={refetch}>
│   └── index.ts
├── components/
│   ├── habit-card.component.tsx    one row: name + streak badge + tap-to-toggle
│   ├── habit-card.interface.ts     type HabitCardProps = { habit: Habit; onToggle: ... }
│   ├── streak-badge.component.tsx  reusable badge showing "5-day streak"
│   ├── streak-badge.interface.ts
│   └── index.ts                    re-exports both
├── hooks/
│   ├── use-habits.ts               React Query: useQuery({ queryKey: ["habits"], ... })
│   └── use-toggle-habit.ts         React Query: useMutation({ mutationFn: ... })
├── interfaces/
│   └── habit.interface.ts          type Habit = { id, name, completedDates: string[] }
└── utils/
    └── format-streak.ts            (completedDates: string[]) => number — pure function
```

How a tap flows through the layers:

1. User taps a `<HabitCard>` (component) → `onToggle(habit.id)` fires.
2. `HabitsSuccessView` (success view) catches that callback, calls `toggleHabit.mutate(habit.id)` from `useToggleHabit`.
3. `useToggleHabit` (hook) calls the service that talks to Firebase, invalidates the `["habits"]` query on success.
4. `useHabits` automatically refetches. The switch (`habits.view.tsx`) re-renders the success branch with the new data; `HabitsSuccessView` renders the updated streak on the card.

Each layer touched exactly one thing. None of them know what's happening in the other layers.

### Worked example 2 — a "profile" feature with two screens (view + edit)

The user has a profile page that shows their info, and an edit screen for changing it. One feature, two pages, shared components.

```
src/page/profile/
├── profile.page.tsx                read-only profile screen
├── edit-profile.page.tsx           edit screen (same feature, second page)
├── profile.constants.ts            { title: "Profile", saveButton: "Save changes" }
├── index.ts                        export { ProfilePage, EditProfilePage }
├── views/
│   ├── profile.view.tsx            switch: useProfile() → loading / error / success
│   ├── profile-success.view.tsx    renders the profile (handles "no profile yet" inline)
│   ├── profile-loading.view.tsx
│   ├── profile-error.view.tsx
│   ├── edit-profile.view.tsx       form view; uses useProfile + useUpdateProfile mutation
│   └── index.ts
├── components/
│   ├── profile-header.component.tsx   avatar + name + email
│   ├── profile-header.interface.ts
│   ├── profile-stats.component.tsx    "joined Apr 2025, 23 habits"
│   ├── profile-stats.interface.ts
│   ├── edit-profile-form.component.tsx  RHF + Zod form
│   ├── edit-profile-form.interface.ts
│   └── index.ts
├── hooks/
│   ├── use-profile.ts              useQuery profile by id
│   └── use-update-profile.ts       useMutation with cache invalidation
├── interfaces/
│   └── profile.interface.ts        type Profile = { id, name, email, joinedAt, ... }
└── utils/
    └── format-joined-date.ts       (joinedAt: number) => "Joined April 2025"
```

Two things to notice:

- **One feature, two pages**: `profile.page.tsx` and `edit-profile.page.tsx` live side by side. Their route files (`app/(tabs)/profile.tsx` and `app/(tabs)/profile/edit.tsx`) import them respectively. The feature folder owns both pages because they share components, hooks, and types.
- **`edit-profile` is a form view, not a 4-state read view.** It still consumes hooks (`useProfile` for the initial values, `useUpdateProfile` for the submission), but it has different state needs — form draft state, submission pending, validation errors. The 3-state switch pattern is for read views; form views render a single composite UI and surface their state inline.

If `edit-profile` ever grew big enough to need its own components folder, it'd be a sign to **split the feature** into `profile/` and `edit-profile/`, not to add nested folders. Features are flat. Subdivision means a feature split.

### The three tiers

**Page (`*.page.tsx`)** — composition only. The page wraps the screen in providers, layouts, error boundaries, and `SafeAreaView`. The page does not call data hooks, does not own state, does not decide UI variants. A page is small (~10–40 lines) and reads like a recipe.

**View (`*.view.tsx`)** — decisions. The primary `<feature>.view.tsx` is **the switch** — it consumes hooks, looks at loading / error / data, and delegates to one of three sibling files (`<feature>-success.view.tsx`, `<feature>-loading.view.tsx`, `<feature>-error.view.tsx`). The success view receives the data and decides internally whether to render the list or an empty CTA. **Empty is a sub-state of success, not a peer of loading/error.**

**Component (`*.component.tsx`)** — pixels. Takes props, returns JSX. Never fetches data. Never imports `services/`. Never owns load-bearing state. Reference theme tokens, never hardcode literals. If you delete a component and drop it into another project with the same prop shape, it works.

## Why feature-scoped (and not flat)

The V1 of this skill used a flat layout — `src/views/`, `src/hooks/`, `src/components/` at the top level. Feature-scoped is a meaningful step up:

- **Self-contained features.** A feature is one folder. Delete it = delete one folder. Move it = move one folder. No surgery across half a dozen top-level folders.
- **Predictable paths.** Anyone — human or AI — can read `src/page/habits/views/habits-success.view.tsx` and predict what's inside.
- **Bounded blast radius.** Touching a feature touches one folder. Touching the design tokens touches one folder. Touching the data layer touches one folder. The architecture limits damage by construction.

This is the pattern used by mature production codebases (including the one this skill is modeled on). It scales from a single-feature MVP to a multi-tab app without needing a refactor.

## Why a page → view → component split (three tiers, not two)

V1 collapsed page and view into one file. V2 separates them because they're doing different jobs:

- **Page**: composition. Boring. Stable. Rarely changes.
- **View**: decisions. Volatile. Changes whenever the data shape or UX flow changes.

Keeping them separate means the volatile part (the view) gets touched without disturbing the stable part (the page). It also means the route file in `app/` only needs to know about the page — it doesn't care whether the view's internal state machine got more complicated.

## Why three view states, not four

Earlier iterations of this scaffold had a separate `<feature>-empty.view.tsx`. We dropped it.

The realization came from looking at how production codebases actually structure this — they don't have separate empty files. Empty is a **sub-state of success**: the fetch succeeded, the data is just an empty array. Putting "render the empty UI when there's nothing to show" inside the success view groups related logic together and avoids the awkward question "where is the success rendering?" having two answers.

The new layout:

- `<feature>.view.tsx` — the switch. Three branches: loading, error, success.
- `<feature>-success.view.tsx` — renders the data. Handles `if (data.length === 0) return <EmptyState />` inline.
- `<feature>-loading.view.tsx` — skeleton.
- `<feature>-error.view.tsx` — error UI + retry.

Benefits of the three-file structure (vs inlining everything into one view file or splitting into four):

**1. The switch is brain-dead easy to read.** Three lines of `if`/`return`. A reviewer sees the entire state machine in five seconds.

**2. The empty state is grouped with success rendering.** The empty UI is the "no data" branch of "I successfully got the data." That's a sub-state, not a separate state — and the file structure should reflect that.

**3. Loading skeletons live in their own file.** A real skeleton matches the success layout's shape (same column widths, same row heights). Keeping it in a sibling file means it can grow as detailed as it needs to be without bloating the switch.

**4. Errors with retry feel robust.** Putting the retry button inside the error variant — not deferred to a global error toast — means every fetch failure has a recovery path. That single UX choice is a huge perceived-quality win for a small architectural cost.

**5. Each variant tests in isolation.** A test for `HabitsErrorView` synthesizes an error and asserts the retry button works. A test for `HabitsSuccessView` passes a known data array. No mocking React Query.

**6. AI agents and reviewers spot missing variants by glancing at the `views/` folder.** If `HabitsView` ships without a `habits-loading.view.tsx`, the omission is visible from a directory listing.

The pattern costs ~3 extra files per fetching view. The payoff is bugs you never ship and a UX that feels intentional from day one.

## Why React Query for server state

V1 hand-rolled a `FetchState<T>` primitive so students could see what React Query is doing for them. V2 ships React Query directly, because:

1. **Production codebases use it.** This is the convention students will encounter at their first real job. Better to learn it now.
2. **It does more than `FetchState<T>` ever will.** Cache, dedupe concurrent requests, refetch on focus, retries, optimistic updates. Implementing all of that by hand would be its own course.
3. **The view pattern doesn't change.** A view consuming a React Query hook still switches on `isLoading` / `isError` / data — the three-state pattern is preserved.

If a student wants to understand the primitive, the Part 4 course content still teaches `FetchState<T>` from scratch before the scaffold introduces React Query.

## Why Context first, Zustand only when needed

V1 jumped straight to Zustand for client state. V2's priority order:

1. **React Query** for server state.
2. **React Context** for client state shared across a subtree (the default).
3. **Zustand** only when Context becomes insufficient — vanilla stores, perf-sensitive selectors, complex multi-action state.

Reasons to default to Context: zero dependencies, no boilerplate, built into React, sufficient for most apps. The scaffold ships `AuthProvider` as the canonical Context-first example.

Zustand is added by the student when they hit one of its specific use cases. We don't pre-install it because students who don't need it shouldn't have to learn it.

## Why services are mandatory

You can write a React Native app with Firebase imported directly in every component that needs data. It works. It's also unrefactorable — the moment you decide to swap providers, support offline mode, or add caching, every component changes.

A service is the boundary between "the rest of the app" and "the external world." Hooks call services. Services do the SDK-specific work and return clean shapes. Swapping Firebase for Supabase touches only `src/services/`; the views, components, and hooks keep working because they talk to the service interface.

V2 ships two services (`authService`, `userService`) as worked examples. As the user adds features, they add a service per external surface.

## What we use for styling (globally)

There is no global stylesheet. React Native doesn't have a CSS cascade, so "global styles" don't work the way they do on web. What we have instead are three pieces of shared infrastructure that every component opts into.

**1. Design tokens (`src/theme/`).** This is the canonical global. Five files:

- `colors.ts` — brand color (filled in at scaffold time), surfaces, text, semantic states (success/warning/error), borders
- `spacing.ts` — a single scale (`xxs` to `xxl`)
- `typography.ts` — variants (`display`, `title`, `body`, `caption`) with matching font size + weight + line height
- `radii.ts` — border radii (`none` through `pill`)
- `index.ts` — wires the tokens into a React Native Paper MD3 theme and exports both the raw tokens and the theme

Every component imports tokens by name (`colors.primary`, `spacing.md`, `radii.lg`) rather than literal values. Change a token in `theme/colors.ts` and every consumer re-renders with the new value.

**2. React Native Paper (the UI library).** Wired at the root via `<PaperProvider theme={theme}>` in `src/providers/app-providers.tsx`. Every Paper component (`<Text>`, `<Button>`, `<Card>`, `<TextInput>`) automatically picks up the theme. Use Paper components as the default and only build custom presentational components when Paper doesn't have what you need.

**3. Local `StyleSheet.create` per file.** The actual style objects are defined inside each component or view file, not in a shared global file. This is the React Native convention and it matches the "props in, JSX out" mental model: a component's styles are part of the component, not a separate concern. Styles reference tokens; they don't hardcode literals.

```tsx
// Example: a component file using tokens via StyleSheet.create
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { colors, spacing } from "@/theme";

export const StreakBadge = ({ days }: { days: number }) => (
  <View style={styles.container}>
    <Text variant="labelLarge" style={styles.label}>{days}-day streak</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  label: {
    color: colors.primary,
  },
});
```

**What we are NOT using:**

- **No CSS-in-JS** (no Emotion, no styled-components). React Native doesn't need them — the `style` prop is already a JavaScript object.
- **No NativeWind / Tailwind for RN.** Excellent library, but adds a build step and a vocabulary. The token-based approach gives you the same renaming-is-cheap property without the dependency.
- **No global `.css` file.** There's no such thing in RN. The closest equivalent is the Paper theme + the design tokens.
- **No per-component `.styles.ts` files (yet).** The auth feature inlines its `StyleSheet.create` inside each `.component.tsx` / `.view.tsx`. If a component's styles ever grow past ~30 lines, extract them to a sibling `.styles.ts` file. The pattern is documented in `guidelines/styling.md` but isn't enforced for small components.

The whole system is built so that **the only place a color or pixel value ever appears is `src/theme/`.** Every component reaches into it. Renaming the brand color is a one-line change.

## Why AGENTS.md is an index, not a doc

V1's AGENTS.md inlined the rules. V2's AGENTS.md points at `guidelines/` (the single source of truth) and `best_practices.md` (the high-level summary).

The reason: AGENTS.md, custom skills in `.agents/skills/`, and per-file READMEs all need to reference the same rules. If those rules are duplicated across files, they drift. With a single source-of-truth folder, each consumer references the canonical file. Change a rule once; everywhere it's referenced picks up the change.

The `wire-up-agents-md` skill (a later course module) extends this pattern for existing codebases that don't have it yet.
