// MechanicAvailabilityCard — the "available for jobs" toggle. Dumb: value in,
// toggle out.

import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { Switch, Text } from "react-native-paper";

import { AppCard } from "@/components";
import { colors, fontSize, fontWeight, spacing } from "@/theme";

import { PROFILE_COPY } from "../profile.constants";

type MechanicAvailabilityCardProps = {
  isAvailable: boolean;
  pending: boolean;
  onToggle: (next: boolean) => void;
};

export const MechanicAvailabilityCard = memo(function MechanicAvailabilityCard({
  isAvailable,
  pending,
  onToggle,
}: MechanicAvailabilityCardProps) {
  return (
    <AppCard>
      <View style={styles.row}>
        <View style={styles.text}>
          <Text style={styles.label}>{PROFILE_COPY.availabilityLabel}</Text>
          <Text style={styles.muted}>{PROFILE_COPY.availabilityHint}</Text>
        </View>
        <Switch
          value={isAvailable}
          onValueChange={onToggle}
          disabled={pending}
          color={colors.primary}
        />
      </View>
    </AppCard>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  text: {
    flex: 1,
    gap: spacing.xxs,
  },
  label: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
  muted: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
