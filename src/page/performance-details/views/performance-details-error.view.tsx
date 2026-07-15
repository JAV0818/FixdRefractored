import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { AppButton } from "@/components";
import { colors, fontSize, spacing } from "@/theme";

import { PERFORMANCE_COPY } from "../performance-details.constants";

type PerformanceDetailsErrorViewProps = {
  onRetry: () => void;
};

export const PerformanceDetailsErrorView = ({ onRetry }: PerformanceDetailsErrorViewProps) => (
  <View style={styles.container}>
    <Text style={styles.message}>{PERFORMANCE_COPY.error}</Text>
    <AppButton onPress={onRetry}>{PERFORMANCE_COPY.retry}</AppButton>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.md,
  },
  message: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
