import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { AppButton } from "@/components";
import { colors, spacing } from "@/theme";

import { ADMIN_MECHANICS_COPY } from "../admin-mechanics.constants";

type Props = { onRetry: () => void };

export const AdminMechanicsErrorView = ({ onRetry }: Props) => (
  <View style={styles.container}>
    <Text variant="titleMedium" style={styles.title}>
      Something went wrong
    </Text>
    <Text variant="bodyMedium" style={styles.message}>
      {ADMIN_MECHANICS_COPY.error}
    </Text>
    <AppButton onPress={onRetry}>{ADMIN_MECHANICS_COPY.retry}</AppButton>
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
