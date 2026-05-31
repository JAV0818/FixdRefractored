// RatingItem — one DVI checkpoint: label, a green/yellow/red rating, and an
// optional note. Dumb: value in, change events out.

import { memo } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";

import { AppTextInput } from "@/components";
import { colors, fontSize, fontWeight, radii, spacing } from "@/theme";
import type { InspectionRating } from "@/types/inspection.interface";

import { INSPECTION_COPY } from "../inspection-checklist.constants";

const RATINGS: { value: InspectionRating; label: string; color: string }[] = [
  { value: "green", label: "Good", color: colors.success },
  { value: "yellow", label: "Fair", color: colors.warning },
  { value: "red", label: "Poor", color: colors.danger },
];

type RatingItemProps = {
  itemKey: string;
  label: string;
  rating: InspectionRating | null;
  note: string;
  // The key is threaded back so the parent can pass ONE stable callback for every
  // item — otherwise an inline arrow per item would defeat this component's memo
  // and re-render all items on each keystroke.
  onChangeRating: (key: string, rating: InspectionRating) => void;
  onChangeNote: (key: string, note: string) => void;
};

export const RatingItem = memo(function RatingItem({
  itemKey,
  label,
  rating,
  note,
  onChangeRating,
  onChangeNote,
}: RatingItemProps) {
  return (
    <View style={styles.item}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pills}>
        {RATINGS.map((r) => {
          const selected = rating === r.value;
          // Dynamic color per rating — inline is unavoidable here. Unselected =
          // a soft tint of the color (`33` ≈ 20% alpha); selected = solid fill.
          return (
            <TouchableOpacity
              key={r.value}
              activeOpacity={0.8}
              onPress={() => onChangeRating(itemKey, r.value)}
              style={[styles.pill, { backgroundColor: selected ? r.color : `${r.color}33` }]}
            >
              <Text style={[styles.pillText, { color: selected ? colors.onPrimary : r.color }]}>
                {r.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <AppTextInput
        value={note}
        onChangeText={(text) => onChangeNote(itemKey, text)}
        placeholder={INSPECTION_COPY.notePlaceholder}
        dense
      />
    </View>
  );
});

const styles = StyleSheet.create({
  item: {
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  label: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
  pills: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  pill: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
  },
  pillText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
});
