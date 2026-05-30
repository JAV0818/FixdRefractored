// StatusHint — a passive, centered note for order states with no action
// (e.g. "We're finding a mechanic"). Shared by the customer + provider actions.

import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { colors, fontSize, radii, spacing } from "@/theme";

type StatusHintProps = {
  text: string;
};

export const StatusHint = memo(function StatusHint({ text }: StatusHintProps) {
  return (
    <View style={styles.hint}>
      <Text style={styles.hintText}>{text}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  hint: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  hintText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
