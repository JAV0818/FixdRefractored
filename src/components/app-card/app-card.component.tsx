// AppCard — the app's standard surface card (white background, rounded, padded).
// Use instead of re-declaring `backgroundColor: colors.surface` + radius +
// padding inline. Pass `style` to tweak spacing/gap for a specific use.

import { StyleSheet, View } from "react-native";
import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";

import { colors, radii, spacing } from "@/theme";

type AppCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const AppCard = ({ children, style }: AppCardProps) => (
  <View style={[styles.card, style]}>{children}</View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
});
