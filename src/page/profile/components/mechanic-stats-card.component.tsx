// MechanicStatsCard — rating / jobs / earnings tiles. Dumb: data in, JSX out.

import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { AppCard } from "@/components";
import { colors, fontSize, fontWeight, spacing } from "@/theme";
import type { ProviderDetails } from "@/types/user.interface";

import { PROFILE_COPY } from "../profile.constants";
import { formatMoney, formatRating } from "../utils/profile-format";
import { StatTile } from "./stat-tile.component";

type MechanicStatsCardProps = {
  provider: ProviderDetails;
};

export const MechanicStatsCard = memo(function MechanicStatsCard({
  provider,
}: MechanicStatsCardProps) {
  return (
    <AppCard style={styles.card}>
      <Text style={styles.title}>{PROFILE_COPY.mechanicStatsTitle}</Text>
      <View style={styles.stats}>
        <StatTile label={PROFILE_COPY.rating} value={formatRating(provider.averageRating)} />
        <StatTile
          label={PROFILE_COPY.jobsCompleted}
          value={String(provider.totalJobsCompleted)}
        />
        <StatTile label={PROFILE_COPY.earnings} value={formatMoney(provider.totalEarnings)} />
      </View>
    </AppCard>
  );
});

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  stats: {
    flexDirection: "row",
    gap: spacing.md,
  },
});
