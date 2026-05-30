import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { AppButton } from "@/components";

import { colors, spacing } from "@/theme";

import { CUSTOMER_HOME_COPY } from "../customer-home.constants";

type CustomerHomeErrorViewProps = {
  onRetry: () => void;
};

export const CustomerHomeErrorView = ({ onRetry }: CustomerHomeErrorViewProps) => (
  <View style={styles.container}>
    <Text variant="titleMedium" style={styles.title}>
      Something went wrong
    </Text>
    <Text variant="bodyMedium" style={styles.message}>
      {CUSTOMER_HOME_COPY.error}
    </Text>
    <AppButton onPress={onRetry}>
      {CUSTOMER_HOME_COPY.retry}
    </AppButton>
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
