# Hooks

A hook is where logic and state live. Components stay dumb because hooks are smart.

## Two kinds of hooks in this codebase

1. **React Query hooks** — wrap a service call.
2. **Context consumers** — read from a Context provider.

That's it for V1. Custom imperative hooks (subscriptions, refs, etc.) come up occasionally, but the two above cover ~95% of what you'll write.

## Naming and location

- File: `use-<name>.ts`. Kebab-case. No `.tsx` extension — hooks return data, not JSX.
- Feature-scoped hooks: `src/page/<feature>/hooks/use-<name>.ts`.
- App-wide hooks: `src/hooks/use-<name>.ts`. Use this only for hooks that genuinely cross features (`use-theme`, `use-auth-context`).

## React Query hooks — read

```ts
// src/page/auth/hooks/use-user-profile.ts
import { useQuery } from "@tanstack/react-query";

import { userService } from "@/services/user-service";

export const useUserProfile = (userId: string | undefined) =>
  useQuery({
    queryKey: ["userProfile", userId],
    queryFn: () => userService.getProfile(userId!),
    enabled: !!userId,
  });
```

Conventions:
- `queryKey` is an array starting with the resource name + any params that affect the result.
- `enabled` guards the query when prerequisites aren't met.
- Return the `useQuery` result directly. The view destructures `{ data, isLoading, isError, error, refetch }`.

## React Query hooks — write (mutations)

```ts
// src/page/auth/hooks/use-sign-in.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authService } from "@/services/auth-service";

import type { SignInCredentials } from "../interfaces/auth-credentials.interface";

export const useSignIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentials: SignInCredentials) => authService.signIn(credentials),
    onSuccess: () => {
      // Invalidate anything that should refetch after sign-in
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
};
```

The view uses `mutate` or `mutateAsync` to invoke the mutation. The hook handles cache invalidation on success.

## Context consumer hooks

When you have a Context, expose a hook to read it. The hook's job is to throw a useful error if the consumer is outside the provider.

```ts
// src/providers/auth-provider.tsx
export const useAuthContext = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be inside <AuthProvider>");
  return ctx;
};
```

## Rules

- **Only call hooks at the top level** of a component or another hook. Never in loops, conditionals, or callbacks. The rule isn't aesthetic — React tracks hooks by call order.
- **ESLint catches violations**. Trust it.
- **One concern per hook.** `useUserProfile` fetches a profile. It does not also send notifications.
- **Hooks compose.** A `useAuthedHabits` hook can call both `useAuthContext` and `useHabits`. Return what you need.

## Anti-patterns

- **Hook that returns JSX.** Wrong layer. JSX belongs in a view or component.
- **Hook with raw `fetch` inside `useEffect`.** Use React Query.
- **Hook that swallows errors.** Surface them via the hook's return — let the view decide how to render.
- **A "hook" that's actually a pure function.** That's a util, not a hook. Move it to `utils/`.
