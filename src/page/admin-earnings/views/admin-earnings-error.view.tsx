// Error state for the Earnings dashboard.

import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { AppButton } from "@/components";
import { colors, fontSize, fontWeight, spacing } from "@/theme";

import { ADMIN_EARNINGS_COPY } from "../admin-earnings.constants";

type AdminEarningsErrorViewProps = {
  onRetry: () => void;
};

export const AdminEarningsErrorView = ({ onRetry }: AdminEarningsErrorViewProps) => (
  <View style={styles.container}>
    <Text variant="titleMedium" style={styles.title}>
      Something went wrong
    </Text>
    <Text variant="bodyMedium" style={styles.message}>
      {ADMIN_EARNINGS_COPY.error}
    </Text>
    <AppButton onPress={onRetry}>{ADMIN_EARNINGS_COPY.retry}</AppButton>
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
  title: {
    color: colors.textPrimary,
  },
  message: {
    textAlign: "center",
    color: colors.textSecondary,
  },
});
