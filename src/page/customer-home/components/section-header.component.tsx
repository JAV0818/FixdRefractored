// SectionHeader — a titled section label, optionally with a trailing action
// (e.g. "See all"). Dumb: title + optional action come in as props.

import { memo, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { colors, fontSize, fontWeight, spacing } from "@/theme";

type SectionHeaderProps = {
  title: string;
  action?: ReactNode;
};

export const SectionHeader = memo(function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {action}
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
});
