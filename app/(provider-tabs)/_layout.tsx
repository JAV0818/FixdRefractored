import { Tabs } from "expo-router";
import { colors } from "@/theme";

export default function ProviderTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.surface },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Marketplace", tabBarIcon: () => null }} />
      <Tabs.Screen name="queue" options={{ title: "Queue", tabBarIcon: () => null }} />
      <Tabs.Screen name="messages" options={{ title: "Messages", tabBarIcon: () => null }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: () => null }} />
    </Tabs>
  );
}
