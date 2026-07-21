import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { AppButton } from "@/components";
import { colors, spacing } from "@/theme";

import { CUSTOMER_MESSAGING_COPY } from "../customer-messaging.constants";

type CustomerMessagingErrorViewProps = {
  onRetry: () => void;
};

export const CustomerMessagingErrorView = ({ onRetry }: CustomerMessagingErrorViewProps) => (
  <View style={styles.container}>
    <Text variant="titleMedium" style={styles.title}>
      Something went wrong
    </Text>
    <Text variant="bodyMedium" style={styles.message}>
      {CUSTOMER_MESSAGING_COPY.error}
    </Text>
    <AppButton onPress={onRetry}>{CUSTOMER_MESSAGING_COPY.retry}</AppButton>
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
  message: {
    color: colors.textSecondary,
    textAlign: "center",
  },
  title: {
    color: colors.textPrimary,
  },
});
