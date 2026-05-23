import { Tabs } from "expo-router";
import { colors } from "@/theme";

export default function CustomerTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.surface },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Services", tabBarIcon: () => null }} />
      <Tabs.Screen name="requests" options={{ title: "Requests", tabBarIcon: () => null }} />
      <Tabs.Screen name="messages" options={{ title: "Messages", tabBarIcon: () => null }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: () => null }} />
    </Tabs>
  );
}
