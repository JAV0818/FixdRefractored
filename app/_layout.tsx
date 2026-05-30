// Root layout — loads fonts, wires global providers, enforces the auth gate.
//
// Auth gate logic:
//   !isHydrated                → branded loading screen (prevents role-flicker)
//   !currentUser               → sign-in
//   !hasCompletedOnboarding    → onboarding flow
//   role === 'customer'        → (customer-tabs)
//   role === 'provider'        → (provider-tabs)
//   role === 'owner'           → (admin-tabs)
//
// Flicker prevention: returning a loading screen (not null) while !isHydrated
// ensures neither tab group ever mounts before the role is confirmed.

import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
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
import { SpaceMono_400Regular, SpaceMono_700Bold } from "@expo-google-fonts/space-mono";

import { AppProviders, useAuthContext } from "@/providers";
import { colors } from "@/theme";

const LoadingScreen = () => (
  <View style={styles.loading}>
    <ActivityIndicator size="large" color={colors.primary} />
  </View>
);

const InitialLayout = () => {
  const router = useRouter();
  const segments = useSegments();
  const theme = useTheme();
  const { currentUser, role, hasCompletedOnboarding, isHydrated } = useAuthContext();

  useEffect(() => {
    if (!isHydrated) return;

    const inAuth = segments[0] === "(auth)";
    const inOnboarding = segments[0] === "(onboarding)";
    const inCustomer = segments[0] === "(customer-tabs)";
    const inProvider = segments[0] === "(provider-tabs)";
    const inAdmin = segments[0] === "(admin-tabs)";

    if (!currentUser) {
      if (!inAuth) router.replace("/(auth)/sign-in");
      return;
    }

    if (!hasCompletedOnboarding) {
      if (!inOnboarding) router.replace("/(onboarding)/role-selection");
      return;
    }

    if (role === "customer" && !inCustomer) {
      router.replace("/(customer-tabs)/services");
    } else if (role === "provider" && !inProvider) {
      router.replace("/(provider-tabs)/marketplace");
    } else if (role === "owner" && !inAdmin) {
      router.replace("/(admin-tabs)");
    }
  }, [currentUser, role, hasCompletedOnboarding, isHydrated, segments, router]);

  // Block rendering entirely until role is confirmed — prevents any tab group
  // from flashing before the redirect fires.
  if (!isHydrated) {
    return <LoadingScreen />;
  }

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

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
});
