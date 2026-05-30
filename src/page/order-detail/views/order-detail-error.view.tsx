import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { AppButton } from "@/components";

import { colors, spacing } from "@/theme";

import { ORDER_DETAIL_COPY } from "../order-detail.constants";

type OrderDetailErrorViewProps = {
  message?: string;
  onRetry?: () => void;
};

export const OrderDetailErrorView = ({ message, onRetry }: OrderDetailErrorViewProps) => (
  <View style={styles.container}>
    <Text variant="titleMedium" style={styles.title}>
      Something went wrong
    </Text>
    <Text variant="bodyMedium" style={styles.message}>
      {message ?? ORDER_DETAIL_COPY.error}
    </Text>
    {onRetry && (
      <AppButton onPress={onRetry}>
        {ORDER_DETAIL_COPY.retry}
      </AppButton>
    )}
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
