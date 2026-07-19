// GlassCard — translucent card with a glassy border and shadow.
//
// Dumb component: props in, JSX out. No data fetching. No services. No
// load-bearing state. References theme tokens, never literal values.

import { memo } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import type { ReactNode } from "react";

import { colors, radii, shadows, spacing } from "@/theme";

import type { GlassCardProps } from "./glass-card.interface";

export const GlassCard = memo(function GlassCard({ children, style }: GlassCardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.glassSurface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.glass,
  },
});
