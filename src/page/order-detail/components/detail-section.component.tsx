// DetailSection — a titled card section on the order-detail screen. Dumb:
// renders a heading + whatever content the view passes as children.

import { memo, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { colors, fontSize, fontWeight, radii, spacing } from "@/theme";

type DetailSectionProps = {
  title: string;
  children: ReactNode;
};

export const DetailSection = memo(function DetailSection({ title, children }: DetailSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
});

const styles = StyleSheet.create({
  section: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
