// EmergencyBanner — high-visibility call to action for urgent breakdowns.
// Dumb: renders the prompt and surfaces a tap. The view decides where it goes.

import { memo } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

import { colors, fontSize, fontWeight, radii, spacing } from "@/theme";

type EmergencyBannerProps = {
  title: string;
  subtitle: string;
  onPress: () => void;
};

export const EmergencyBanner = memo(function EmergencyBanner({
  title,
  subtitle,
  onPress,
}: EmergencyBannerProps) {
  return (
    <TouchableOpacity style={styles.banner} activeOpacity={0.85} onPress={onPress}>
      <Ionicons name="warning" size={26} color={colors.onPrimary} />
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.onPrimary} />
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.danger,
    borderRadius: radii.lg,
  },
  copy: {
    flex: 1,
    gap: spacing.xxs,
  },
  title: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.onPrimary,
  },
  subtitle: {
    fontSize: fontSize.xs,
    color: colors.onPrimary,
    opacity: 0.85,
  },
});
