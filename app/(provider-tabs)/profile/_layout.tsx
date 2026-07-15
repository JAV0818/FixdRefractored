import { Stack } from "expo-router";

// Profile stack: the index is headerless; sub-screens (performance, change-password)
// render Stack.Screen with headerShown: true to get a native back arrow.
export default function ProfileStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
