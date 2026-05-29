import { Stack } from "expo-router";

// Stack for the Services tab: the home (index) is headerless; quote-request
// opts back into a header via its own <Stack.Screen> options.
export default function ServicesStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
