import { Stack } from "expo-router";

// Queue stack: the list (index) is headerless; detail + quote-builder set their own.
export default function QueueStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
