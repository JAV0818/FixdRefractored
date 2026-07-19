// IconActionButton — circular glassy button with an icon and a small label below.
//
// Dumb component: props in, JSX out. No data fetching. No services. No
// load-bearing state. References theme tokens, never literal values.

import { memo } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { colors, fontSize, fontWeight, radii, shadows, spacing } from "@/theme";

import type { IconActionButtonProps } from "./icon-action-button.interface";

const ICON_SIZE = 24;
const BUTTON_SIZE = 56;

export const IconActionButton = memo(function IconActionButton({
  icon,
  label,
  onPress,
  destructive = false,
  disabled = false,
  loading = false,
}: IconActionButtonProps) {
  const tint = destructive ? colors.danger : colors.primary;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled || loading}
      style={styles.container}
    >
      <View style={[styles.circle, { borderColor: tint }]}>
        {loading ? (
          <ActivityIndicator color={tint} />
        ) : (
          <MaterialCommunityIcons name={icon} size={ICON_SIZE} color={tint} />
        )}
      </View>
      <Text style={[styles.label, { color: tint }]} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: spacing.xs,
    minWidth: 72,
  },
  circle: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: radii.full,
    backgroundColor: colors.glassSurfaceHighlight,
    borderWidth: 1,
    borderColor: colors.glassBorderStrong,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.glass,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    textAlign: "center",
  },
});
