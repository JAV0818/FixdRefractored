import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

import { colors, spacing } from "@/theme";

import { PROVIDER_QUEUE_COPY } from "../provider-queue.constants";

type Props = { onRetry: () => void };

export const ProviderQueueErrorView = ({ onRetry }: Props) => (
  <View style={styles.container}>
    <Text variant="titleMedium" style={styles.title}>
      Something went wrong
    </Text>
    <Text variant="bodyMedium" style={styles.message}>
      {PROVIDER_QUEUE_COPY.error}
    </Text>
    <Button mode="contained" onPress={onRetry}>
      {PROVIDER_QUEUE_COPY.retry}
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
