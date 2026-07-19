import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { FloatingTabBar } from "@/components";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const tabIcon =
  (active: IoniconName, inactive: IoniconName) =>
  ({ color, focused }: { color: string; focused: boolean }) => (
    <Ionicons name={focused ? active : inactive} size={22} color={color} />
  );

export default function ProviderTabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen
        name="marketplace"
        options={{
          title: "Marketplace",
          tabBarIcon: tabIcon("briefcase", "briefcase-outline"),
        }}
      />
      <Tabs.Screen
        name="queue"
        options={{
          title: "Queue",
          tabBarIcon: tabIcon("clipboard", "clipboard-outline"),
        }}
      />
      <Tabs.Screen
        name="custom-quote"
        options={{
          title: "Quote",
          tabBarIcon: tabIcon("add-circle", "add-circle"),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: tabIcon("chatbubble", "chatbubble-outline"),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: tabIcon("person", "person-outline"),
        }}
      />
    </Tabs>
  );
}
