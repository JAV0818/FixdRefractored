import { Stack } from "expo-router";

// Requests stack: the list (index) is headerless; order detail sets its own header.
export default function RequestsStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
