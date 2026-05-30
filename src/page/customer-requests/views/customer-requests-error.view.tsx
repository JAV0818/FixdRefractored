import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

import { colors, spacing } from "@/theme";

import { CUSTOMER_REQUESTS_COPY } from "../customer-requests.constants";

type Props = { onRetry: () => void };

export const CustomerRequestsErrorView = ({ onRetry }: Props) => (
  <View style={styles.container}>
    <Text variant="titleMedium" style={styles.title}>
      Something went wrong
    </Text>
    <Text variant="bodyMedium" style={styles.message}>
      {CUSTOMER_REQUESTS_COPY.error}
    </Text>
    <Button mode="contained" onPress={onRetry}>
      {CUSTOMER_REQUESTS_COPY.retry}
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
