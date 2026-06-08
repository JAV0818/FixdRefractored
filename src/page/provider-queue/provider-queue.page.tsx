// Composition shell for the provider Queue tab.

import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, fontSize, fontWeight, spacing } from "@/theme";

import { PROVIDER_QUEUE_COPY } from "./provider-queue.constants";
import { ProviderQueueView } from "./views";

export const ProviderQueuePage = () => (
  <SafeAreaView style={styles.container} edges={["top"]}>
    <View style={styles.header}>
      <Text style={styles.title}>{PROVIDER_QUEUE_COPY.title}</Text>
    </View>
    <ProviderQueueView />
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
