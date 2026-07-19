// FilterChipRow — a single-select horizontal chip row.
// Dumb: the options, the selected value, and the select handler come in as props.

import { memo } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Chip } from "react-native-paper";

import { colors, spacing } from "@/theme";

type FilterOption = {
  value: string;
  label: string;
};

type FilterChipRowProps = {
  options: FilterOption[];
  selected: string;
  onSelect: (value: string) => void;
};

export const FilterChipRow = memo(function FilterChipRow({
  options,
  selected,
  onSelect,
}: FilterChipRowProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.row}
      contentContainerStyle={styles.container}
    >
      {options.map((option) => {
        const isSelected = option.value === selected;
        return (
          <Chip
            key={option.value}
            mode={isSelected ? "flat" : "outlined"}
            selected={isSelected}
            showSelectedCheck={false}
            onPress={() => onSelect(option.value)}
            style={isSelected ? styles.chipSelected : styles.chip}
            textStyle={isSelected ? styles.chipTextSelected : styles.chipText}
          >
            {option.label}
          </Chip>
        );
      })}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  row: {
    flexGrow: 0,
  },
  container: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  chip: {
    backgroundColor: colors.surface,
  },
  chipSelected: {
    backgroundColor: colors.primary,
  },
  chipText: {
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.onPrimary,
  },
});
