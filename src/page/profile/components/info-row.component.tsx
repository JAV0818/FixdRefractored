// InfoRow — a read-only labelled value (caption over value). Used for contact
// fields and vehicle attributes. Dumb: primitives in, JSX out.

import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { colors, fontSize, spacing } from "@/theme";

type InfoRowProps = {
  label: string;
  value: string;
};

export const InfoRow = memo(function InfoRow({ label, value }: InfoRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    gap: spacing.xxs,
  },
  label: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  value: {
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
});
