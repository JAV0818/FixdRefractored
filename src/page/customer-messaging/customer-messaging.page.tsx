// Composition shell for the customer Messages tab.

import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, fontSize, fontWeight, spacing } from "@/theme";

import { CUSTOMER_MESSAGING_COPY } from "./customer-messaging.constants";
import { CustomerMessagingView } from "./views";

export const CustomerMessagingPage = () => (
  <SafeAreaView style={styles.container} edges={["top"]}>
    <View style={styles.header}>
      <Text style={styles.title}>{CUSTOMER_MESSAGING_COPY.title}</Text>
    </View>
    <CustomerMessagingView />
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: fontSize["2.5xl"],
    fontWeight: fontWeight.bold,
  },
});
