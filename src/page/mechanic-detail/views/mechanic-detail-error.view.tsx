// Error state for the mechanic detail screen.

import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { AppButton } from "@/components";
import { colors, spacing } from "@/theme";

import { MECHANIC_DETAIL_COPY } from "../mechanic-detail.constants";

type MechanicDetailErrorViewProps = {
  onRetry: () => void;
};

export const MechanicDetailErrorView = ({ onRetry }: MechanicDetailErrorViewProps) => (
  <View style={styles.container}>
    <Text variant="titleMedium" style={styles.title}>
      Something went wrong
    </Text>
    <Text variant="bodyMedium" style={styles.message}>
      {MECHANIC_DETAIL_COPY.error}
    </Text>
    <AppButton onPress={onRetry}>{MECHANIC_DETAIL_COPY.retry}</AppButton>
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
