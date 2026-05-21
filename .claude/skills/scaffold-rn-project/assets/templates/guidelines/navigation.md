# Navigation

This project uses **Expo Router** for navigation. Routes are file-system based — every file in `app/` becomes a route. The mental model is identical to Next.js App Router; the primitives are different.

## File-system routing primer

```
app/
├── _layout.tsx                   root layout — wraps every route
├── (auth)/                       group: routes inside don't appear in the URL
│   ├── _layout.tsx               layout for the auth group
│   ├── sign-in.tsx               → /sign-in (route file)
│   └── sign-up.tsx               → /sign-up
└── (tabs)/                       group for authenticated routes
    ├── _layout.tsx               tab bar lives here
    ├── index.tsx                 → / (the home route)
    └── profile.tsx               → /profile
```

Conventions:

- **`_layout.tsx`** is a layout file. Wraps every child route. Use it for nav stacks, tab bars, providers scoped to a section.
- **`(group)`** is a route group — the folder name is wrapped in parens, which means it does NOT appear in the URL path. Use groups to share a layout across a set of routes without exposing the folder name.
- **`[param].tsx`** is a dynamic segment. The value is available via `useLocalSearchParams()`.
- **`[...slug].tsx`** is a catch-all dynamic segment.
- **`+not-found.tsx`** at the root catches unmatched routes.

## Route file shape

Route files in this codebase are **thin** — they import the page from `src/page/<feature>/` and re-export it. They never contain JSX of their own. The composition lives in the page file.

```tsx
// app/(auth)/sign-in.tsx
import { SignInPage } from "@/page/auth/sign-in.page";

export default SignInPage;
```

That's it. The route file's only job is wiring the URL path to the page file.

## Navigating between screens

Two ways. Pick based on whether the user is taking an explicit action or it's a programmatic redirect.

### `<Link>` for user-initiated navigation

```tsx
import { Link } from "expo-router";

<Link href="/sign-up" asChild>
  <Button>Don't have an account? Sign up</Button>
</Link>
```

`<Link>` renders a Pressable that navigates on tap. The `asChild` prop lets you wrap any other component. This is the right tool for nav-bar items, buttons, and any "the user tapped to go somewhere" case.

### `useRouter()` for programmatic navigation

```tsx
import { useRouter } from "expo-router";

const router = useRouter();
router.push("/welcome");        // push onto the stack (back button works)
router.replace("/(tabs)");      // replace the current route (no back)
router.back();                  // pop one level off the stack
```

Use `router.push` when the user is going somewhere new. Use `router.replace` for redirects (sign-in success → home, sign-out → sign-in) where you don't want them to be able to back-button to the screen they just left.

## Passing data between screens

**Don't.** Two screens shouldn't share complex state via navigation params.

What you should do instead: pass an **id**, fetch the data on the destination screen.

```tsx
// Wrong — passing a whole habit object
router.push({ pathname: "/habit/[id]", params: { habit: JSON.stringify(habit) } });

// Right — pass just the id, refetch on arrival
router.push(`/habit/${habit.id}`);
```

```tsx
// app/habit/[id].tsx → src/page/habit-detail/habit-detail.page.tsx
import { useLocalSearchParams } from "expo-router";
import { useHabit } from "@/page/habit-detail/hooks/use-habit";

export const HabitDetailView = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const habit = useHabit(id);
  // ... switch on loading / error / success ...
};
```

React Query caches the habit if it's already in memory, so the "refetch" is often a free cache hit. Passing complex objects via params is fragile (they have to serialize through URL params), and you lose any opportunity for React Query to dedupe or refresh the data.

The only thing that's safe to pass via params: **ids and small primitives** (strings, numbers, booleans).

## The auth gate

Authenticated apps need to redirect:
- An unauthenticated user trying to reach a `(tabs)` route → bounce to `(auth)/sign-in`
- An authenticated user trying to reach an `(auth)` route → bounce to `(tabs)`

The scaffold ships this in `app/_layout.tsx` using `useSegments` + `useRouter` + the `AuthProvider` context:

```tsx
const InitialLayout = () => {
  const router = useRouter();
  const segments = useSegments();
  const { currentUser, isHydrated } = useAuthContext();

  useEffect(() => {
    if (!isHydrated) return;                           // wait for Firebase
    const inAuthGroup = segments[0] === "(auth)";
    if (currentUser && inAuthGroup) router.replace("/(tabs)");
    else if (!currentUser && !inAuthGroup) router.replace("/(auth)/sign-in");
  }, [currentUser, isHydrated, segments, router]);

  return <Stack screenOptions={{ headerShown: false }} />;
};
```

`useSegments()` returns the active route segments — `["(auth)", "sign-in"]` for `/sign-in`, `["(tabs)"]` for `/`. The `useEffect` watches both the auth state and the current segments; when either changes, it redirects if the user is in the wrong group.

`router.replace` (not `push`) so the user can't back-button to a screen they shouldn't be on.

## Stack.Screen options

To configure a screen's header, title, animation, or presentation, render a `<Stack.Screen>` element inside the route or page:

```tsx
import { Stack } from "expo-router";

export const SignInPage = () => (
  <>
    <Stack.Screen options={{ title: "Sign in", headerShown: true }} />
    <SafeAreaView style={{ flex: 1 }}>
      <SignInView />
    </SafeAreaView>
  </>
);
```

Useful options:
- `title` — string shown in the header
- `headerShown` — show/hide the header entirely
- `presentation: "modal"` — present as a modal sheet (full-screen on iOS by default)
- `animation: "slide_from_right" | "fade" | "none"` — transition animation
- `gestureEnabled` — allow swipe-to-go-back on iOS

For screens that should never have a header (most full-screen flows), set `headerShown: false` at the layout level rather than per-screen.

## How to add a new screen

1. **Create the route file** in `app/`. If it's a tab route, put it in `app/(tabs)/<name>.tsx`. If it's an unauthenticated route, `app/(auth)/<name>.tsx`. If it's a standalone screen, `app/<name>.tsx`.

2. **Create the feature folder** in `src/page/<feature>/` if one doesn't already exist for this concern. Inside it:
   - `<name>.page.tsx` — composition shell
   - `views/<name>.view.tsx` — the switch
   - `views/<name>-success.view.tsx` — success rendering
   - `views/<name>-loading.view.tsx` — skeleton
   - `views/<name>-error.view.tsx` — error UI
   - `hooks/use-<name>.ts` — data fetch
   - `interfaces/<name>.interface.ts` — types if needed

3. **Wire the route file to the page**: `import { MyPage } from "@/page/feature/my.page"; export default MyPage;`

4. **Add navigation from existing screens** with `<Link>` or `router.push`.

5. **Test the route** by navigating to it in the running dev server.

## Anti-patterns

- **JSX inside a route file.** Route files re-export pages. They have no other job.
- **Data fetching in a route file or `_layout.tsx`** (other than the auth gate). Layouts run on every navigation; a fetch in a layout reruns on every nav. Use a page → view → hook instead.
- **Passing complex objects via params.** Pass ids; refetch on arrival.
- **`router.push` for redirects.** Use `router.replace` so the user can't back-button to a screen they shouldn't be on.
- **`useRouter` inside a component.** Components should accept callbacks via props and let the parent view decide where to navigate. The component is the "what to render"; the view is the "what happens when you tap."
