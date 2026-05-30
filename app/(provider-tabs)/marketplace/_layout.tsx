import { Stack } from "expo-router";

// Marketplace stack: the pool list (index) is headerless; detail sets its own.
export default function MarketplaceStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
