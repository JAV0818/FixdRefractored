// FilterChips — a reusable multi-select chip grid over plain string options.
// Dumb: the options, the selected values, and the toggle handler come in as
// props. Use for any "pick zero or more from a set" UI (e.g. specialties).

import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { Chip } from "react-native-paper";

import { colors, spacing } from "@/theme";

type FilterChipsProps = {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
};

export const FilterChips = memo(function FilterChips({
  options,
  selected,
  onToggle,
}: FilterChipsProps) {
  return (
    <View style={styles.grid}>
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <Chip
            key={option}
            mode={isSelected ? "flat" : "outlined"}
            selected={isSelected}
            showSelectedCheck={false}
            onPress={() => onToggle(option)}
            style={isSelected ? styles.chipSelected : styles.chip}
            selectedColor={isSelected ? colors.onPrimary : colors.textSecondary}
          >
            {option}
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
