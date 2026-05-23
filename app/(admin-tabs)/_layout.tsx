import { Tabs } from "expo-router";
import { colors } from "@/theme";

export default function AdminTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.surface },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Orders", tabBarIcon: () => null }} />
    </Tabs>
  );
}
