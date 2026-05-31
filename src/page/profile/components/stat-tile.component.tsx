// StatTile — one labelled metric (big value over a small caption). Sits in a
// row of 2–3. Dumb: primitives in, JSX out.

import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { colors, fontSize, fontWeight, spacing } from "@/theme";

type StatTileProps = {
  label: string;
  value: string;
};

export const StatTile = memo(function StatTile({ label, value }: StatTileProps) {
  return (
    <View style={styles.tile}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    gap: spacing.xxs,
  },
  value: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  label: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
});
