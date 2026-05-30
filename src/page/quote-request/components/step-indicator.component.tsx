// StepIndicator — "Step X of N" label plus a row of progress dots. Dumb.

import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { colors, fontSize, fontWeight, radii, spacing } from "@/theme";

type StepIndicatorProps = {
  current: number; // zero-based
  total: number;
};

export const StepIndicator = memo(function StepIndicator({ current, total }: StepIndicatorProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{`Step ${current + 1} of ${total}`}</Text>
      <View style={styles.dots}>
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i <= current ? styles.dotActive : styles.dotInactive]}
          />
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  dots: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  dot: {
    flex: 1,
    height: 4,
    borderRadius: radii.full,
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
  dotInactive: {
    backgroundColor: colors.surfaceVariant,
  },
});
