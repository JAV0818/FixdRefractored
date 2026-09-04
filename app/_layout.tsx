// Root layout — loads fonts, wires global providers, enforces the auth gate.
//
// Auth gate logic (render-time, no useEffect gap):
//   !isHydrated                → branded loading screen (prevents role-flicker)
//   !currentUser               → <Redirect> to sign-in (Stack never mounts)
//   !hasCompletedOnboarding    → <Redirect> to onboarding flow
//   role === 'customer'        → <Redirect> to (customer-tabs)
//   role === 'provider'        → <Redirect> to (provider-tabs)
//   role === 'owner'           → <Redirect> to (admin-tabs)
//
// Anti-flash rule: redirects are computed at render time via <Redirect>, not
// via useEffect + router.replace. The Stack only mounts when segments already
// match the correct destination — zero-frame gap between state resolution and
// navigation. See best_practices.md § Auth Gate.

import { Redirect, Stack, useSegments } from "expo-router";
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
  const segments = useSegments();
  const theme = useTheme();
  const { currentUser, role, hasCompletedOnboarding, isHydrated } = useAuthContext();

  // Auth state not yet resolved — hold here, Stack must not mount yet.
  if (!isHydrated) return <LoadingScreen />;

  // Not signed in — redirect before Stack ever mounts.
  if (!currentUser && segments[0] !== "(auth)")
    return <Redirect href="/(auth)/sign-in" />;

  // Signed in but onboarding incomplete.
  if (currentUser && !hasCompletedOnboarding && segments[0] !== "(onboarding)")
    return <Redirect href="/(onboarding)/role-selection" />;

  // Signed in + onboarded — route to the correct role group.
  if (currentUser && hasCompletedOnboarding) {
    if (role === "customer" && segments[0] !== "(customer-tabs)")
      return <Redirect href="/(customer-tabs)/services" />;
    if (role === "provider" && segments[0] !== "(provider-tabs)")
      return <Redirect href="/(provider-tabs)/marketplace" />;
    if (role === "owner" && segments[0] !== "(admin-tabs)")
      return <Redirect href="/(admin-tabs)/orders" />;
  }

  // Segments already match the correct destination — render the Stack.
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
