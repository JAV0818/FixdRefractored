// ImagePickerGrid — thumbnails of the chosen photos plus an "Add" tile. Dumb:
// it never opens the picker itself (that's a side effect the view owns). It
// just renders the current uris and emits add/remove events.

import { memo } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

import { colors, fontSize, radii, spacing } from "@/theme";

type ImagePickerGridProps = {
  uris: string[];
  max: number;
  onAdd: () => void;
  onRemove: (uri: string) => void;
};

export const ImagePickerGrid = memo(function ImagePickerGrid({
  uris,
  max,
  onAdd,
  onRemove,
}: ImagePickerGridProps) {
  const canAddMore = uris.length < max;

  return (
    <View style={styles.grid}>
      {uris.map((uri) => (
        <View key={uri} style={styles.thumbWrap}>
          <Image source={{ uri }} style={styles.thumb} />
          <TouchableOpacity style={styles.remove} onPress={() => onRemove(uri)} hitSlop={8}>
            <Ionicons name="close" size={14} color={colors.onPrimary} />
          </TouchableOpacity>
        </View>
      ))}

      {canAddMore && (
        <TouchableOpacity style={styles.addTile} onPress={onAdd} activeOpacity={0.8}>
          <Ionicons name="camera-outline" size={26} color={colors.primary} />
          <Text style={styles.addLabel}>{`${uris.length}/${max}`}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

const TILE = 96;

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  thumbWrap: {
    width: TILE,
    height: TILE,
  },
  thumb: {
    width: TILE,
    height: TILE,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceVariant,
  },
  remove: {
    position: "absolute",
    top: -spacing.xs,
    right: -spacing.xs,
    width: 22,
    height: 22,
    borderRadius: radii.full,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  addTile: {
    width: TILE,
    height: TILE,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.outline,
    borderStyle: "dashed",
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xxs,
  },
  addLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
});
