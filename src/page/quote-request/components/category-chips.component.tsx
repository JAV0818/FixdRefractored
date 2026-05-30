// CategoryChips — multi-select chip grid over SERVICE_CATEGORIES. Dumb: the
// selected labels and the toggle handler come in as props.

import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { Chip } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

import { colors, spacing } from "@/theme";
import { SERVICE_CATEGORIES } from "@/constants/service-categories";

type CategoryChipsProps = {
  selected: string[];
  onToggle: (label: string) => void;
};

export const CategoryChips = memo(function CategoryChips({
  selected,
  onToggle,
}: CategoryChipsProps) {
  return (
    <View style={styles.grid}>
      {SERVICE_CATEGORIES.map((category) => {
        const isSelected = selected.includes(category.label);
        // One color drives both the icon and the label: white when selected,
        // the secondary grey (matching body copy) when not.
        const contentColor = isSelected ? colors.onPrimary : colors.textSecondary;
        return (
          <Chip
            key={category.id}
            icon={({ size }) => <Ionicons name={category.icon} size={size} color={contentColor} />}
            mode={isSelected ? "flat" : "outlined"}
            selected={isSelected}
            showSelectedCheck={false}
            onPress={() => onToggle(category.label)}
            style={isSelected ? styles.chipSelected : styles.chip}
            selectedColor={contentColor}
          >
            {category.label}
          </Chip>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.surface,
  },
  chipSelected: {
    backgroundColor: colors.primary,
  },
});
