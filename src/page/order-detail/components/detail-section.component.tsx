// DetailSection — a titled card section on the order-detail screen. Dumb:
// renders a heading + whatever content the view passes as children.

import { memo, type ReactNode } from "react";
import { StyleSheet } from "react-native";
import { Text } from "react-native-paper";

import { AppCard } from "@/components";
import { colors, fontSize, fontWeight } from "@/theme";

type DetailSectionProps = {
  title: string;
  children: ReactNode;
};

export const DetailSection = memo(function DetailSection({ title, children }: DetailSectionProps) {
  return (
    <AppCard>
      <Text style={styles.title}>{title}</Text>
      {children}
    </AppCard>
  );
});

const styles = StyleSheet.create({
  title: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
