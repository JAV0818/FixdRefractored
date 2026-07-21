// Composition shell for the provider collect-payment screen.

import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";

import { colors } from "@/theme";

import { COLLECT_PAYMENT_COPY } from "./collect-payment.constants";
import { CollectPaymentView } from "./views";

export const CollectPaymentPage = () => (
  <>
    <Stack.Screen
      options={{
        headerShown: true,
        title: COLLECT_PAYMENT_COPY.title,
        headerBackButtonDisplayMode: "minimal",
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
      }}
    />
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <CollectPaymentView />
    </SafeAreaView>
  </>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
