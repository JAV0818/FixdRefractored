// Group layout for unauthenticated routes (sign-in, sign-up).
//
// Renders a plain stack — no tab bar.

import { Stack } from "expo-router";

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
