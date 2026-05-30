// Composition shell for the customer Requests tab.

import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, fontSize, fontWeight, spacing } from "@/theme";

import { CUSTOMER_REQUESTS_COPY } from "./customer-requests.constants";
import { CustomerRequestsView } from "./views";

export const CustomerRequestsPage = () => (
  <SafeAreaView style={styles.container} edges={["top"]}>
    <View style={styles.header}>
      <Text style={styles.title}>{CUSTOMER_REQUESTS_COPY.title}</Text>
    </View>
    <CustomerRequestsView />
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize["2.5xl"],
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
});
