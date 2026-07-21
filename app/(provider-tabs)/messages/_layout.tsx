import { Stack } from "expo-router";

// Messages stack: the list (index) is headerless; the chat detail sets its own.
export default function MessagesStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
