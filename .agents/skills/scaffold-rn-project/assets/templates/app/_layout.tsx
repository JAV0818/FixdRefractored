// Root layout — wires global providers AND enforces the auth gate.
//
// The InitialLayout component reads the AuthProvider context and redirects
// the user to the matching route group whenever auth state changes:
//   - signed in + in (auth) group → bounce to (tabs)
//   - signed out + outside (auth) group → bounce to (auth)/sign-in
//
// router.replace (not push) so the user can't back-button to a screen they
// shouldn't be on.

import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

import { AppProviders, useAuthContext } from "@/providers";

const InitialLayout = () => {
  const router = useRouter();
  const segments = useSegments();
  const { currentUser, isHydrated } = useAuthContext();

  useEffect(() => {
    if (!isHydrated) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (currentUser && inAuthGroup) {
      router.replace("/(tabs)");
    } else if (!currentUser && !inAuthGroup) {
      router.replace("/(auth)/sign-in");
    }
  }, [currentUser, isHydrated, segments, router]);

  return <Stack screenOptions={{ headerShown: false }} />;
};

export default function RootLayout() {
  return (
    <AppProviders>
      <InitialLayout />
    </AppProviders>
  );
}
