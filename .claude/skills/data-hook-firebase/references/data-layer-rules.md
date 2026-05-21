# Reference: data-layer rules

Load this when the user asks about React Query, the service layer, or why the hooks return this specific shape.

## The three layers, in plain English

The data layer for any HTTP-backed resource has three pieces:

1. **Service** (`src/services/<resource>-service.ts`) — the only file in the app that imports from `firebase/*` (or your REST client) for this resource. It exposes pure async functions: `list()`, `get(id)`, `create(input)`, etc. They take typed inputs and return typed outputs.
2. **Hook** (`src/page/<feature>/hooks/use-<resource>.ts` and friends) — wraps the service in React Query. Returns the standard `useQuery` / `useMutation` shape.
3. **View** (`src/page/<feature>/views/<feature>.view.tsx`) — calls the hook, switches on its state, renders the matching variant.

Each layer talks only to the next one above it. Views never call services. Components never call hooks (they receive data via props). Services never import from `firebase/*` outside their own file.

## Why React Query for all server data

The hand-written alternative is `useState` + `useEffect` + `fetch`. Every team that has tried it has eventually rewritten it because the gaps add up:

- **Caching across components.** Without React Query, two screens hitting the same endpoint cause two fetches. With it, the second is a cache hit.
- **Dedupe.** Two simultaneous calls to the same endpoint get folded into one network request.
- **Refetch on focus.** When the user comes back to a tab/screen, the data refreshes — free.
- **Retries with backoff.** Built in. Configurable.
- **Loading and error states without a thousand `useState` calls.** `isLoading`, `isError`, `error`, `data` come from the hook, not from manual state management.
- **Mutation cache invalidation.** `queryClient.invalidateQueries(['habits'])` after a mutation forces fresh data; no manual state shuffling.

Reimplementing any one of those is a real project. Reimplementing all of them is unwise.

## Why the service is mandatory

A component that imports from `firebase/firestore` directly works. It also makes the codebase non-refactorable.

- Swap Firebase for Supabase? With a service layer, you change `src/services/<resource>-service.ts` and the rest of the app keeps working. Without it, you change every consumer.
- Add caching, request deduplication, offline support? With a service layer, you wrap the SDK calls in one place. Without it, you have to wrap them everywhere.
- Add a typed interface around an untyped SDK? Same — one place, not everywhere.

A service is a tiny investment (~50 lines) that pays off the first time the data backend changes.

## Why the hook returns `{ data, isLoading, isError, error, refetch }`

This is what React Query's `useQuery` already returns. We don't transform or re-shape it. Two benefits:

1. **Views are uniform.** Every fetching view switches on the same shape. Reviewer recognition; new developer onboarding; no surprises.
2. **The full React Query API stays available.** `refetch`, `fetchStatus`, `dataUpdatedAt`, etc. — all the niche fields are there when needed.

When a view needs the success path, it destructures `data`. When it needs the empty path, it checks `data.length === 0` inside the success view. When it needs the error path, it reads `error.message` from the error view's props.

## The mutation flow

A mutation hook returns `{ mutate, mutateAsync, isPending, isError, error }`. The view calls `mutate(input)` from an event handler:

```tsx
const createHabit = useCreateHabit();

const onSubmit = (name: string) => {
  createHabit.mutate({ name, completedDates: [] });
};
```

The hook handles cache invalidation on success — the next time `useHabits()` is read, it fetches fresh data because the cache for the `["habits"]` key was invalidated. You don't manually splice the new record into local state; React Query refetches.

## Anti-patterns this skill prevents

- **Component calling `fetch` directly.** Bypasses caching, deduplication, error handling.
- **Component importing from `firebase/firestore`.** Couples UI to the data backend forever.
- **Hook returning a custom-shaped object.** Every consumer has to learn the new shape; every test has to mock it; no React Query niche features are accessible.
- **Mutation that doesn't invalidate the relevant query.** Stale UI; the user sees their own write missing until they refresh.
