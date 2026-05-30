// Composition shell for the shared order-detail screen (customer + provider).

import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";

import { colors } from "@/theme";

import { OrderDetailView } from "./views";

export const OrderDetailPage = () => (
  <>
    <Stack.Screen
      options={{
        headerShown: true,
        title: "",
        headerBackButtonDisplayMode: "minimal",
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
      }}
    />
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <OrderDetailView />
    </SafeAreaView>
  </>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
