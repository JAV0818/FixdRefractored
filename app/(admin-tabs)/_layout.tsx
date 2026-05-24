import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { FloatingTabBar } from "@/components";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const tabIcon = (active: IoniconName, inactive: IoniconName) =>
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
        name="index"
        options={{
          title: "Orders",
          tabBarIcon: tabIcon("list", "list-outline"),
        }}
      />
    </Tabs>
  );
}
