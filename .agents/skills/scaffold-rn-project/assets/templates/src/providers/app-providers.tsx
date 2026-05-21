// Composes all app-wide providers. Rendered from the root layout.
//
// Order matters:
// - PaperProvider: theme for all Paper components (innermost-friendly).
// - QueryProvider: React Query needs a QueryClient before any hook runs.
// - AuthProvider: subscribes to Firebase auth; depends on Firebase init.

import type { ReactNode } from "react";
import { PaperProvider } from "react-native-paper";

import { theme } from "@/theme";

import { AuthProvider } from "./auth-provider";
import { QueryProvider } from "./query-provider";

type AppProvidersProps = {
  children: ReactNode;
};

export const AppProviders = ({ children }: AppProvidersProps) => (
  <PaperProvider theme={theme}>
    <QueryProvider>
      <AuthProvider>{children}</AuthProvider>
    </QueryProvider>
  </PaperProvider>
);
