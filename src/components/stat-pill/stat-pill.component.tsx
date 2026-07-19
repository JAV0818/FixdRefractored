// StatPill — small glassy stat display with a value over a label.
//
// Dumb component: props in, JSX out. No data fetching. No services. No
// load-bearing state. References theme tokens, never literal values.

import { memo } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { Text } from "react-native-paper";

import { colors, fontSize, fontWeight, radii, shadows, spacing } from "@/theme";

import type { StatPillProps } from "./stat-pill.interface";

export const StatPill = memo(function StatPill({ label, value, style }: StatPillProps) {
  return (
    <View style={[styles.pill, style]}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  pill: {
    flex: 1,
    backgroundColor: colors.glassSurfaceHighlight,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.glassBorderStrong,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
    gap: spacing.xxs,
    ...shadows.glass,
  },
  value: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.glassText,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.glassTextMuted,
    textAlign: "center",
  },
});
