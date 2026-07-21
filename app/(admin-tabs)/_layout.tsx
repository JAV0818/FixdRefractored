import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { FloatingTabBar } from "@/components";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const tabIcon =
  (active: IoniconName, inactive: IoniconName) =>
  ({ color, focused }: { color: string; focused: boolean }) => (
    <Ionicons name={focused ? active : inactive} size={22} color={color} />
  );

export default function AdminTabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: tabIcon("list", "list-outline"),
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: "Earnings",
          tabBarIcon: tabIcon("cash", "cash-outline"),
        }}
      />
      <Tabs.Screen
        name="mechanics"
        options={{
          title: "Mechanics",
          tabBarIcon: tabIcon("build", "build-outline"),
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
