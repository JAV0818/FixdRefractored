import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { FloatingTabBar } from "@/components";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const tabIcon =
  (active: IoniconName, inactive: IoniconName) =>
  ({ color, focused }: { color: string; focused: boolean }) => (
    <Ionicons name={focused ? active : inactive} size={22} color={color} />
  );

export default function CustomerTabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen
        name="services"
        options={{
          title: "Services",
          tabBarIcon: tabIcon("construct", "construct-outline"),
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: "Requests",
          tabBarIcon: tabIcon("document-text", "document-text-outline"),
        }}
      />
      <Tabs.Screen
        name="create-request"
        options={{
          title: "Create",
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
