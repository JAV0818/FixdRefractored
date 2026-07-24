// Composes all app-wide providers.
//
// Order:
//   PaperProvider    → theme for all Paper components
//   QueryProvider    → React Query client before any hook runs
//   CometChatProvider → SDK init before auth (login happens right after sign-in)
//   AuthProvider     → Firebase auth state + Firestore user profile

import type { ReactNode } from "react";
import { PaperProvider } from "react-native-paper";
import { StripeProvider } from "@stripe/stripe-react-native";

import { theme } from "@/theme";
import { AuthProvider } from "./auth-provider";
import { QueryProvider } from "./query-provider";
import { CometChatProvider } from "./comet-chat-provider";
import { SyncCometChatProfile } from "./sync-comet-chat-profile";

const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

// eslint-disable-next-line no-console
console.log("[StripeProvider] publishable key present:", STRIPE_PUBLISHABLE_KEY.length > 0);
// eslint-disable-next-line no-console
console.log("[StripeProvider] key prefix:", STRIPE_PUBLISHABLE_KEY.slice(0, 12));

type AppProvidersProps = {
  children: ReactNode;
};

export const AppProviders = ({ children }: AppProvidersProps) => (
  <PaperProvider theme={theme}>
    <QueryProvider>
      <CometChatProvider>
        <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
          <AuthProvider>
            <SyncCometChatProfile />
            {children}
          </AuthProvider>
        </StripeProvider>
      </CometChatProvider>
    </QueryProvider>
  </PaperProvider>
);
