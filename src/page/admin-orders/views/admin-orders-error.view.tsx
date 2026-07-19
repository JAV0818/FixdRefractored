import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { AppButton } from "@/components";
import { colors, spacing } from "@/theme";

import { ADMIN_ORDERS_COPY } from "../admin-orders.constants";

type AdminOrdersErrorViewProps = {
  onRetry: () => void;
};

export const AdminOrdersErrorView = ({ onRetry }: AdminOrdersErrorViewProps) => (
  <View style={styles.container}>
    <Text variant="titleMedium" style={styles.title}>
      Something went wrong
    </Text>
    <Text variant="bodyMedium" style={styles.message}>
      {ADMIN_ORDERS_COPY.error}
    </Text>
    <AppButton onPress={onRetry}>{ADMIN_ORDERS_COPY.retry}</AppButton>
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
