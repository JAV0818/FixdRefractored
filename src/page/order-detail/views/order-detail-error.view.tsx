import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

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
      <Button mode="contained" onPress={onRetry}>
        {ORDER_DETAIL_COPY.retry}
      </Button>
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
