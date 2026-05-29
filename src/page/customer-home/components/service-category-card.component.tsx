// ServiceCategoryCard — a tappable category tile in the horizontal scroller on
// the Services home. Dumb: the label/icon come in as props, the tap is an event.

import { memo } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

import { colors, fontSize, fontWeight, radii, spacing } from "@/theme";
import type { ServiceCategory } from "@/constants/service-categories";

type ServiceCategoryCardProps = {
  category: ServiceCategory;
  onPress: (category: ServiceCategory) => void;
};

export const ServiceCategoryCard = memo(function ServiceCategoryCard({
  category,
  onPress,
}: ServiceCategoryCardProps) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => onPress(category)}>
      <View style={styles.iconWrap}>
        <Ionicons name={category.icon} size={24} color={colors.primary} />
      </View>
      <Text style={styles.label} numberOfLines={2}>
        {category.label}
      </Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    width: 104,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    alignItems: "center",
    gap: spacing.sm,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceVariant,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    textAlign: "center",
  },
});
