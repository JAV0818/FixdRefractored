import { memo } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

import { colors, fontSize, fontWeight, radii, spacing } from "@/theme";
import type { MechanicProfile } from "@/types/user.interface";

import { ADMIN_MECHANICS_COPY } from "../admin-mechanics.constants";

type MechanicListItemProps = {
  mechanic: MechanicProfile;
  onPress: () => void;
};

const availabilityMeta = {
  available: { bg: colors.surfaceVariant, fg: colors.success },
  unavailable: { bg: colors.surfaceVariant, fg: colors.textSecondary },
} as const;

export const MechanicListItem = memo(function MechanicListItem({
  mechanic,
  onPress,
}: MechanicListItemProps) {
  const isAvailable = mechanic.providerProfile.isAvailable;
  const jobCount = mechanic.providerProfile.totalJobsCompleted;
  const meta = availabilityMeta[isAvailable ? "available" : "unavailable"];

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>
            {mechanic.name}
          </Text>
          <View style={[styles.badge, { backgroundColor: meta.bg }]}>
            <Text style={[styles.badgeText, { color: meta.fg }]}>
              {isAvailable ? ADMIN_MECHANICS_COPY.available : ADMIN_MECHANICS_COPY.unavailable}
            </Text>
          </View>
        </View>
        {isAvailable && jobCount > 0 && (
          <Text style={styles.jobs}>{ADMIN_MECHANICS_COPY.jobsCompleted(jobCount)}</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
  },
  body: {
    flex: 1,
    gap: spacing.xs,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  name: {
    flex: 1,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  jobs: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
