import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { AppButton } from "@/components";
import { colors, spacing } from "@/theme";

import { PROVIDER_MESSAGING_COPY } from "../provider-messaging.constants";

type ProviderMessagingErrorViewProps = {
  onRetry: () => void;
};

export const ProviderMessagingErrorView = ({ onRetry }: ProviderMessagingErrorViewProps) => (
  <View style={styles.container}>
    <Text variant="titleMedium" style={styles.title}>
      Something went wrong
    </Text>
    <Text variant="bodyMedium" style={styles.message}>
      {PROVIDER_MESSAGING_COPY.error}
    </Text>
    <AppButton onPress={onRetry}>{PROVIDER_MESSAGING_COPY.retry}</AppButton>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    gap: spacing.md,
    justifyContent: "center",
    padding: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
  },
  message: {
    color: colors.textSecondary,
    textAlign: "center",
  },
});
