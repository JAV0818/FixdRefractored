// InspectionSection — a collapsible DVI section card (tap the header to toggle).
// Owns only local expand/collapse UI state.

import { useState, type ReactNode } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

import { AppCard } from "@/components";
import { colors, fontSize, fontWeight, spacing } from "@/theme";

type InspectionSectionProps = {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
};

export const InspectionSection = ({
  title,
  children,
  defaultExpanded = false,
}: InspectionSectionProps) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <AppCard>
      <TouchableOpacity
        style={styles.header}
        activeOpacity={0.7}
        onPress={() => setExpanded((e) => !e)}
      >
        <Text style={styles.title}>{title}</Text>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
      {expanded && <View style={styles.body}>{children}</View>}
    </AppCard>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  body: {
    gap: spacing.xs,
  },
});
