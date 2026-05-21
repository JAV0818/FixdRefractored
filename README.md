# Fixd

A React Native app built on Expo SDK 54.

## Stack

- **Expo SDK 54** with **Expo Router** (file-system-based navigation)
- **TypeScript** strict mode
- **React Query** (`@tanstack/react-query`) for server state
- **React Context** for client state (Zustand only if/when Context isn't enough)
- **React Native Paper** for UI (Material Design 3) — themed with this app's design tokens
- **React Hook Form + Zod** for forms and validation
- **Firebase** for auth + Firestore

## Getting started

```bash
npm install
cp .env.example .env   # then fill in your Firebase config
npm run dev
```

In the Expo dev menu that appears:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan the QR code with the [Expo Go](https://expo.dev/client) app on a real device

> **Heads up**: The Expo Go app on your phone must be on SDK 54. If it's a different version, update Expo Go from the App Store / Play Store, or change `sdkVersion` in `app.json` and run `npx expo install --check`.

## Project structure

```
app/                                Expo Router routes — file-system navigation.
  _layout.tsx                       Root layout: PaperProvider + QueryProvider + AuthProvider.
  (auth)/                           Group for unauthenticated routes.
    sign-in.tsx                       → renders src/page/auth/sign-in.page.tsx
    sign-up.tsx                       → renders src/page/auth/sign-up.page.tsx
  (tabs)/                           Group for authenticated routes.
    index.tsx                         → renders src/page/auth/welcome.page.tsx
src/
  page/<feature>/                   Feature-scoped pages. Everything for a feature lives here.
    <name>.page.tsx                   Composition only (no logic, no data).
    views/<name>.view.tsx             Data fetching + state decisions.
    components/                       Dumb presentational (props in, events out).
    hooks/use-*.ts                    React Query and Context consumers. No JSX.
    interfaces/                       Types for this feature.
    utils/                            Pure transforms, no React.
  providers/                        App-wide Context providers.
  services/                         External integrations (Firebase, query-client).
  theme/                            Design tokens (colors, spacing, typography, radii).
  types/                            Cross-cutting TS types.
  utils/                            Cross-cutting pure utilities.
guidelines/                         Single source of truth for all rules.
.agents/skills/                     Custom skills for AI agents (empty by default).
AGENTS.md                           Index — points at guidelines/ and best_practices.md.
best_practices.md                   Project best practices, kept concise.
```

## Architectural rules

This project follows the **feature-scoped 3-tier hierarchy**:

- **`.page.tsx`** — composition only. No logic.
- **`.view.tsx`** — data fetching + decisions on which state to render.
- **`.component.tsx`** — dumb presentational. Props in, events out.

Server state lives in React Query hooks. Client state defaults to React Context. See [`AGENTS.md`](./AGENTS.md) for the rules index and [`guidelines/`](./guidelines) for the full rules.

## License

© 2026. Personal project.
