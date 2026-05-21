# State management

Pick the right tool. Default to the simpler one. Escalate only when you have evidence.

## The priority order

1. **React Query** for any data fetched over the network. Always. No exceptions.
2. **React Context** for client state shared across a subtree.
3. **Zustand (+ Immer)** when Context isn't enough.

## Rule 1 — React Query for server state

Any value that lives on a server is **server state**. Server state belongs to React Query. Reasons:

- Caches results across renders and components.
- Deduplicates concurrent requests automatically.
- Handles stale data, refetch on focus, retries.
- Built-in `isLoading` / `isError` / `data` machinery — matches the four-state view pattern out of the box.

The pattern in this codebase:

```tsx
// src/page/auth/hooks/use-user-profile.ts
export const useUserProfile = (userId: string | undefined) =>
  useQuery({
    queryKey: ["userProfile", userId],
    queryFn: () => userService.getProfile(userId!),
    enabled: !!userId,
  });
```

Hooks return what `useQuery` returns. Views destructure `{ data, isLoading, isError, error, refetch }` and switch on it.

**Never** use raw `fetch` or `useEffect` for HTTP. If the data is on a server, it's React Query.

## Rule 2 — React Context for client state

Client state is everything that doesn't come from a server: auth-aware UI flags, theme preferences, form drafts before submission, "is this menu open."

For most cases, React Context is the right tool:

```tsx
// src/providers/auth-provider.tsx
type AuthContextValue = {
  currentUser: AuthUser | undefined;
  isHydrated: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | undefined>(undefined);
  const [isHydrated, setIsHydrated] = useState(false);
  // ... subscribe to auth changes ...
  return (
    <AuthContext.Provider value={{ currentUser, isHydrated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be inside AuthProvider");
  return ctx;
};
```

Context is enough for the vast majority of client state. It has zero dependencies, no boilerplate, and is built into React.

## Rule 3 — Zustand only when Context isn't enough

Zustand is not in the default scaffold. Add it when you hit one of these specific problems:

- **You need to read or update state outside React.** A vanilla Zustand store works in plain functions. Context doesn't.
- **Performance: many subscribers, one of which updates often.** Context re-renders every consumer when value changes. Zustand selectors only re-render subscribers to the selected slice.
- **Complex state with many actions.** A Zustand store keeps actions and state together; Context tends to spawn helper functions outside the provider.
- **Middleware**: Immer, devtools, persistence, etc. Zustand supports these out of the box.

When you do reach for Zustand, use Immer's `produce` for safe state updates:

```ts
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type DraftStore = {
  draft: string;
  setDraft: (value: string) => void;
};

export const useDraftStore = create<DraftStore>()(
  immer((set) => ({
    draft: "",
    setDraft: (value) => set((state) => { state.draft = value; }),
  })),
);
```

## Never mix server state into a client store

The most common architectural mistake in this category of app is putting React Query data into a Zustand store. **Don't.** Server state lives in React Query. Client state lives in Context or Zustand. They don't overlap.

## How to choose, in practice

1. Is this data from an HTTP API? → React Query.
2. Otherwise, does it need to be shared across a subtree? → React Context.
3. Otherwise → `useState` local to the component.

If you ever feel pulled toward Zustand, ask yourself which of the four "Zustand-only" reasons applies. If none of them do, Context is still the right choice.
