// MechanicStatsCard — rating / jobs / earnings pills. Dumb: data in, JSX out.

import { memo } from "react";
import { StyleSheet, View } from "react-native";

import { GlassCard, StatPill } from "@/components";
import { spacing } from "@/theme";
import type { ProviderDetails } from "@/types/user.interface";

import { PROFILE_COPY } from "../profile.constants";
import { formatMoney, formatRating } from "../utils/profile-format";

type MechanicStatsCardProps = {
  provider: ProviderDetails;
};

export const MechanicStatsCard = memo(function MechanicStatsCard({
  provider,
}: MechanicStatsCardProps) {
  return (
    <GlassCard style={styles.card}>
      <View style={styles.stats}>
        <StatPill label={PROFILE_COPY.rating} value={formatRating(provider.averageRating)} />
        <StatPill
          label={PROFILE_COPY.jobsCompleted}
          value={String(provider.totalJobsCompleted)}
        />
        <StatPill label={PROFILE_COPY.earnings} value={formatMoney(provider.totalEarnings)} />
      </View>
    </GlassCard>
  );
});

const styles = StyleSheet.create({
  card: {
    paddingVertical: spacing.md,
  },
  stats: {
    flexDirection: "row",
    gap: spacing.md,
  },
});
