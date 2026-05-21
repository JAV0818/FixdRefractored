# Views

A view is the **decisions tier**. It consumes hooks, picks which UI variant to render, delegates the actual pixels to siblings (or to components).

## The three view files per data-fetching screen

For any screen that fetches data, there are three view files:

```
src/page/<feature>/views/
├── <feature>.view.tsx           ← the switch (3-state if/return ladder)
├── <feature>-success.view.tsx   ← renders the data (handles empty as a sub-state)
├── <feature>-loading.view.tsx   ← skeleton matching the success layout
└── <feature>-error.view.tsx     ← error UI + retry
```

The primary `<feature>.view.tsx` is **the switch**: it consumes hooks, looks at loading / error / data, and returns the matching sibling. It contains no rendering of its own beyond the conditional branches. It's mechanical.

`<feature>-success.view.tsx` is the **success-state UI** — what the user actually sees when everything works. **Empty (no data) is handled inside this file as an early-return**, not as a separate `.view.tsx`. That's deliberate: empty is a sub-state of success (the fetch worked, there's just nothing to show), not a peer of loading/error.

## Why three, not four

V1 of this skill had a separate `<feature>-empty.view.tsx`. We dropped it because:

1. **Empty is a sub-state of success**, not a peer of loading/error. The fetch succeeded; the data is just empty. Putting "render empty UI when the fetch returned [] " inside the success file groups related logic together.
2. **One file per success state, not two.** The reviewer's question "where's the rendering for this screen?" should have one answer. With both `<feature>-success.view.tsx` and `<feature>-empty.view.tsx`, the answer is "depends on the data" — which is the wrong frame.
3. **It matches what real teams ship.** Production codebases (including the one this skill is modeled on) don't have separate empty files. Loading and error get their own files because they're situational; empty is just "render this when the array is empty."

## The switch shape

```tsx
// src/page/habits/views/habits.view.tsx
export const HabitsView = () => {
  const { data, isLoading, isError, error, refetch } = useHabits();

  if (isLoading) return <HabitsLoadingView />;
  if (isError) return <HabitsErrorView error={error} onRetry={refetch} />;
  return <HabitsSuccessView habits={data ?? []} />;
};
```

Three branches. Loading and error each go to their dedicated sibling. The success view receives the data (defaulting to an empty array) and decides internally whether to render the list or the empty-state UI.

## The success-view shape

```tsx
// src/page/habits/views/habits-success.view.tsx
type HabitsSuccessViewProps = {
  habits: Habit[];
};

export const HabitsSuccessView = ({ habits }: HabitsSuccessViewProps) => {
  // Empty as a sub-state — handled here, not in a separate file.
  if (habits.length === 0) {
    return (
      <EmptyState
        title="No habits yet"
        body="Add your first habit to start tracking."
        action={<Button>Add a habit</Button>}
      />
    );
  }

  return <HabitsList habits={habits} />;
};
```

The success view's job: render the data, or render the empty UI if there's no data. Both branches live in this file.

## Rules

- **No inline data fetching in any view.** Use a hook.
- **No business logic in the switch.** That's a hook's job. The switch only decides which sibling to render.
- **No `useState`/`useEffect` in the switch for anything other than UI state** (open/closed dropdowns, selected tab). Load-bearing state goes in a hook.
- **The success view owns its own empty case.** Don't add a fourth state to the switch.
- **One file per situational variant.** Loading and error are situational (whole-screen replacements). Success is the default; its sub-states stay inside its file.

## Composition

When a view consumes multiple hooks, the switch orders guards from "blocker" to "happy path":

```tsx
const ProfileView = () => {
  const auth = useAuthContext();
  const profile = useUserProfile(auth.currentUser?.id);

  if (!auth.isHydrated) return <ProfileLoadingView />;
  if (!auth.currentUser) return <SignInPrompt />;
  if (profile.isLoading) return <ProfileLoadingView />;
  if (profile.isError) return <ProfileErrorView error={profile.error} onRetry={profile.refetch} />;
  return <ProfileSuccessView profile={profile.data} />;
};
```

Pick one state to show — don't render two loading screens.

## What good variants look like

- **Loading**: a skeleton that matches the success layout's shape, not a generic spinner. Prevents page jumps when data arrives.
- **Error**: clear message + retry button. The user should recover without restarting the app.
- **Success**: renders the data. Handles its own empty case inline. Treat the empty UI as onboarding (it's the first thing a new user sees) — explain what's missing AND tell them how to populate it.
