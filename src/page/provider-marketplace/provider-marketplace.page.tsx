// Composition shell for the provider Marketplace tab.

import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, fontSize, fontWeight, spacing } from "@/theme";

import { PROVIDER_MARKETPLACE_COPY } from "./provider-marketplace.constants";
import { ProviderMarketplaceView } from "./views";

export const ProviderMarketplacePage = () => (
  <SafeAreaView style={styles.container} edges={["top"]}>
    <View style={styles.header}>
      <Text style={styles.title}>{PROVIDER_MARKETPLACE_COPY.title}</Text>
    </View>
    <ProviderMarketplaceView />
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
