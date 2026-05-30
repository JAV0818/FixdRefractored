import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

import { colors, spacing } from "@/theme";

import { PROVIDER_MARKETPLACE_COPY } from "../provider-marketplace.constants";

export const ProviderMarketplaceLoadingView = () => (
  <View style={styles.container}>
    <ActivityIndicator animating color={colors.primary} />
    <Text variant="bodyMedium" style={styles.label}>
      {PROVIDER_MARKETPLACE_COPY.loading}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md },
  label: { color: colors.textSecondary },
});
