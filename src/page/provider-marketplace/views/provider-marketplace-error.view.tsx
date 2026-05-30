import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

import { colors, spacing } from "@/theme";

import { PROVIDER_MARKETPLACE_COPY } from "../provider-marketplace.constants";

type Props = { onRetry: () => void };

export const ProviderMarketplaceErrorView = ({ onRetry }: Props) => (
  <View style={styles.container}>
    <Text variant="titleMedium" style={styles.title}>
      Something went wrong
    </Text>
    <Text variant="bodyMedium" style={styles.message}>
      {PROVIDER_MARKETPLACE_COPY.error}
    </Text>
    <Button mode="contained" onPress={onRetry}>
      {PROVIDER_MARKETPLACE_COPY.retry}
    </Button>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    padding: spacing.lg,
  },
  title: { color: colors.textPrimary },
  message: { textAlign: "center", color: colors.textSecondary },
});
