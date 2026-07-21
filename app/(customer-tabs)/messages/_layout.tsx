import { Stack } from "expo-router";

// Messages stack: the list (index) is headerless; chat detail sets its own header.
export default function MessagesStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
