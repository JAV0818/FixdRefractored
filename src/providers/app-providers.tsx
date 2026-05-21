// Composes all app-wide providers.
//
// Order:
//   PaperProvider    → theme for all Paper components
//   QueryProvider    → React Query client before any hook runs
//   CometChatProvider → SDK init before auth (login happens right after sign-in)
//   AuthProvider     → Firebase auth state + Firestore user profile

import type { ReactNode } from "react";
import { PaperProvider } from "react-native-paper";

import { theme } from "@/theme";
import { AuthProvider } from "./auth-provider";
import { QueryProvider } from "./query-provider";
import { CometChatProvider } from "./comet-chat-provider";

type AppProvidersProps = {
  children: ReactNode;
};

export const AppProviders = ({ children }: AppProvidersProps) => (
  <PaperProvider theme={theme}>
    <QueryProvider>
      <CometChatProvider>
        <AuthProvider>{children}</AuthProvider>
      </CometChatProvider>
    </QueryProvider>
  </PaperProvider>
);
