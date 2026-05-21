---
name: scaffold-rn-project
description: Scaffolds a complete Expo plus React Native plus TypeScript starter project using The Cooked Dev Course's feature-scoped architecture (Expo Router, React Query, React Native Paper, Firebase, AGENTS.md plus guidelines folder, kebab-case naming with .page/.view/.component suffixes). Trigger on phrases like "new RN project", "scaffold a mobile app", "start a new Expo app", "set up a React Native starter", "kick off a new mobile project", "build me a mobile starter" — even when the user does not explicitly say "scaffold" or "React Native" but is clearly starting a fresh mobile codebase. The output is runnable immediately (npm run dev works). Do NOT trigger for: adding features to an existing project (use build-performant-component or data-hook-firebase), fixing bugs in current code, or web-only projects.
---

# scaffold-rn-project

Create a fully wired Expo / React Native starter project that follows The Cooked Dev Course's architectural patterns. The user gets a runnable starter — `npm run dev` works immediately after the scaffold finishes.

## What this skill produces

A new directory containing:

- **Runtime**: Expo SDK 51–54 (user picks), Expo Router for file-system-based navigation.
- **Type safety**: TypeScript strict, Prettier.
- **Server state**: React Query (`@tanstack/react-query`). All HTTP fetches go through it; never `fetch` + `useEffect`.
- **Client state**: React Context first (with a sample `AuthProvider`). Zustand is **not** in the default scaffold — add it only when Context proves insufficient.
- **UI**: React Native Paper (Material Design 3) wired to a custom theme of design tokens (colors / spacing / typography / radii). Brand color is taken from the user's answer in the interview.
- **Backend**: Firebase auth + Firestore wrappers.
- **Architecture, demonstrated**: A sample `auth` feature under `src/page/auth/` with sign-in + sign-up + welcome screens, demonstrating both React Query mutations (`useSignIn`, `useSignUp`) and a React Query query (`useUserProfile`) with the full loading / error / empty / success view switch.
- **AGENTS.md index + guidelines/ folder**: AGENTS.md is short and references `guidelines/` and `best_practices.md` as the single source of truth for rules. `.agents/skills/` placeholder for future custom skills.
- **README** linking to design references if the user provided a Figma URL.

## How to use this skill

The skill is interactive. Walk the user through a short interview, then run the scaffold script.

### Step 1 — Gather the answers

You need **six** things. If the user's opening prompt supplied any (likely — most users mention the name and bundle id at least), don't re-ask. Confirm what you have, and prompt only for what's missing.

The six questions, in order:

1. **Project name?** (e.g., `HabitTracker`)
   PascalCase or kebab-case. Goes into `package.json`, `app.json`, the README, and the project folder name.

2. **Display name?** (e.g., `Habit Tracker`)
   The name shown on the phone home screen. **Default rule: ALWAYS insert a space at every PascalCase boundary**, even for brand-style compound names. `HabitTracker` → `Habit Tracker`. `MorningPages` → `Morning Pages`. `FitLog` → `Fit Log`. `TikTok` → `Tik Tok`. Yes, the brand-y ones look slightly awkward — the user gets to correct it at the confirmation step (Step 2). Apply the rule mechanically; don't try to be clever about which compound names "look better" with no space. The mechanical default is more predictable than a judgment call.

3. **Bundle identifier?** (e.g., `com.kingjuju.habittracker`)
   Reverse-DNS, lowercase. If missing, suggest `com.<username>.<projectname-lowercase>`.

4. **Where do you want the project created?**
   Default: `./<project-name>` in the current working directory.

5. **Expo SDK version?** (51, 52, 53, or 54)
   Default: **54**. This determines the version constraints for `expo`, `react`, `react-native`, and `expo-router` in `package.json`. The user's phone's installed Expo Go binary must match this SDK version — if they don't know, default to 54 and they can swap later.

6. **Brand primary color?** (hex, e.g. `#3478F6`)
   Default: `#3478F6` (a generic blue). This goes into `src/theme/colors.ts` as `colors.primary`. Encourages students to plug their brand color in from day one.

**Optional bonus** — if the user mentions Figma or a prototype URL, also capture:

- **Figma URL?** — gets a line in the generated README under "Design references." Otherwise omit the section.

If the user already gave you all six answers in their initial prompt, skip the per-question interview and go straight to confirmation.

### Step 2 — Confirm

Echo the gathered values as a short summary and ask the user to confirm. Example:

> About to scaffold:
> - **Name**: HabitTracker
> - **Display**: Habit Tracker
> - **Bundle**: com.kingjuju.habittracker
> - **Location**: ./HabitTracker
> - **Expo SDK**: 54
> - **Brand color**: #3478F6
>
> Run it? (y / change something)

### Step 3 — Run the scaffold script

Invoke the script with the gathered answers as flags:

```bash
python <path-to-skill>/scripts/scaffold.py \
  --name "HabitTracker" \
  --display "Habit Tracker" \
  --bundle "com.kingjuju.habittracker" \
  --location "./HabitTracker" \
  --sdk 54 \
  --brand-color "#3478F6"
```

Optional flag if the user gave a Figma URL:

```bash
  --figma-url "https://www.figma.com/design/abc/MyApp?node-id=1-2"
```

Notes:
- The script prints a per-file progress count and the total at the end. If it errors, surface the message directly.
- The script initializes a git repo with one commit on `main`. If `git init` fails (sandbox quirks), the script logs it and continues — files are still in place.

### Step 4 — Show next steps

After the script succeeds, give the user this markdown block (substituting their values):

> Project created at `./HabitTracker`.
>
> **Next steps**
> 1. `cd HabitTracker && npm install`
> 2. Copy `.env.example` to `.env` and fill in your Firebase config (Firebase console → Project Settings → Your apps).
> 3. `npm run dev` — launches the Expo dev server.
> 4. Press `i` for iOS Simulator, `a` for Android Emulator, or scan the QR code with the Expo Go app on your phone.
>
> Read `AGENTS.md` for the architectural rules. The full rule files live in `guidelines/` — AGENTS.md is an index, not the doc itself.

## The architecture this skill enforces

A **feature-scoped 3-tier hierarchy**. Every feature gets its own folder under `src/page/<feature>/`; everything that belongs to a feature lives in that folder.

### The three tiers

- **`.page.tsx`** — composition only. Wraps the screen in providers, layouts, error boundaries. Renders `<View>` from the corresponding view file. No logic. No data fetching. No state.
- **`.view.tsx`** — data fetching + decisions. The primary `<feature>.view.tsx` is the **switch**: it calls React Query / Context hooks, looks at `isLoading` / `isError` / data, and delegates to one of three sibling files — `<feature>-success.view.tsx`, `<feature>-loading.view.tsx`, `<feature>-error.view.tsx`. Empty (no data) is handled inside the success view as an early-return, not as a separate file — it's a sub-state of success, not a peer of loading/error.
- **`.component.tsx`** — dumb presentational. Props in, events out. Never imports from `services/` or `firebase`. Reference theme tokens, never hardcode literals.

### The feature folder layout

```
src/page/<feature>/
├── <feature>.page.tsx            ← composition
├── <feature>.constants.ts        ← copy, defaults
├── index.ts                      ← re-exports the page
├── views/                        ← <feature>.view.tsx + state variants
├── components/                   ← .component.tsx + .interface.ts
├── hooks/                        ← use-*.ts (React Query, Context consumers)
├── interfaces/                   ← shared types for this feature
├── utils/                        ← pure transforms (no React)
└── view-state/                   ← pure view transforms (formatters, derivations)
```

Anyone reading a file path can immediately tell its role and its feature. Delete a feature = delete one folder.

### The app-wide layout

```
src/
├── page/                         ← all feature-scoped pages
├── components/                   ← truly cross-feature presentational components (rare)
├── hooks/                        ← truly cross-feature hooks (use-theme, etc.)
├── providers/                    ← React Context providers for client state
├── services/                     ← Firebase init, query client factory, etc.
├── theme/                        ← design tokens
├── types/                        ← cross-cutting TS types
└── utils/                        ← cross-cutting pure utilities
```

### Naming conventions

- **Files and folders**: kebab-case. `habit-card.component.tsx`, not `HabitCard.tsx`.
- **Hooks**: `use-*.ts` (kebab). `use-sign-in.ts`, not `useSignIn.ts`.
- **Suffixes**: `.page.tsx`, `.view.tsx`, `.component.tsx`, `.interface.ts`, `.constants.ts`.
- **Exports**: PascalCase. `HabitCard`, `UseSignIn` (the React identifier inside).
- **Types**: PascalCase. `HabitCardProps`, `SignInCredentials`.

### State management priority

1. **React Query** for any data fetched over the network. Always. Never `fetch`/`useEffect`.
2. **React Context** for client state local to a feature or shared across a subtree.
3. **Zustand** only when Context is insufficient — vanilla stores, perf-sensitive selectors, complex state with many actions. **Not** in the default scaffold; the user adds it when needed.

If the user asks "why this structure?" — load `references/architecture.md` for the long answer.

## Things to watch for

- **The user already has Expo CLI installed.** If they get "command not found" after scaffolding, point them at `npm install -g expo-cli` or just `npx expo start` (which works without a global install — V2's `npm run dev` calls `expo start` under the hood).
- **The bundle ID matters for native builds, not for Expo Go.** Don't let the user spend ten minutes choosing the perfect bundle id.
- **The script makes an initial commit.** If `--location` is inside an existing git working tree, warn the user before running.
- **SDK version must match the user's Expo Go app.** SDK 54 is the V2 default. If their phone's Expo Go is on a different SDK, they'll see an error when scanning the QR code. The fix is to update Expo Go on the phone (App Store / Play Store) or pick a different SDK at scaffold 