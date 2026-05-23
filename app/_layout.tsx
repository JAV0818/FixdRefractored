// Root layout — loads fonts, wires global providers, enforces the auth gate.
//
// Auth gate logic:
//   !isHydrated                → render nothing (wait for Firebase + Firestore read)
//   !currentUser               → sign-in screen
//   !hasCompletedOnboarding    → onboarding flow
//   role === 'customer'        → customer tabs
//   role === 'provider'        → provider tabs
//   role === 'owner'           → admin tabs

import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "react-native-paper";

import { useFonts } from "expo-font";
import {
  Unbounded_400Regular,
  Unbounded_500Medium,
  Unbounded_600SemiBold,
  Unbounded_700Bold,
} from "@expo-google-fonts/unbounded";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  SpaceMono_400Regular,
  SpaceMono_700Bold,
} from "@expo-google-fonts/space-mono";

import { AppProviders, useAuthContext } from "@/providers";

const InitialLayout = () => {
  const router = useRouter();
  const segments = useSegments();
  const theme = useTheme();
  const { currentUser, role, hasCompletedOnboarding, isHydrated } = useAuthContext();

  useEffect(() => {
    if (!isHydrated) return;

    const inAuth = segments[0] === "(auth)";
    const inOnboarding = segments[0] === "(onboarding)";

    if (!currentUser) {
      if (!inAuth) router.replace("/(auth)/sign-in");
      return;
    }

    if (!hasCompletedOnboarding) {
      // Already navigating within onboarding — let the flow proceed
      if (!inOnboarding) router.replace("/(onboarding)/role-selection");
      return;
    }

    if (role === "customer") {
      router.replace("/(customer-tabs)");
    } else if (role === "provider") {
      router.replace("/(provider-tabs)");
    } else if (role === "owner") {
      router.replace("/(admin-tabs)");
    }
  }, [currentUser, role, hasCompletedOnboarding, isHydrated, segments, router]);

  return (
    <>
      <StatusBar style={theme.dark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      />
    </>
  );
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Unbounded_400Regular,
    Unbounded_500Medium,
    Unbounded_600SemiBold,
    Unbounded_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    SpaceMono_400Regular,
    SpaceMono_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AppProviders>
      <InitialLayout />
    </AppProviders>
  );
}
