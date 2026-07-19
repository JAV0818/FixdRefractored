// CustomerSections — the customer-only parts of the profile: saved vehicles and
// activity stats. Dumb: data in, JSX out. (Vehicle add/remove is deferred — see
// DEFERRED.md.)

import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { GlassCard, StatPill } from "@/components";
import { colors, fontSize, fontWeight, spacing } from "@/theme";
import type { Vehicle } from "@/types/user.interface";

import { PROFILE_COPY } from "../profile.constants";
import { formatRating } from "../utils/profile-format";

type CustomerSectionsProps = {
  vehicles: Vehicle[];
  averageRating: number | null;
  totalRatingsCount: number;
  completedOrdersCount: number;
};

const vehicleTitle = (v: Vehicle) => `${v.year} ${v.make} ${v.model}`.trim();
const vehicleDetail = (v: Vehicle) =>
  [v.color, v.licensePlate].filter(Boolean).join(" · ");

export const CustomerSections = memo(function CustomerSections({
  vehicles,
  averageRating,
  totalRatingsCount,
  completedOrdersCount,
}: CustomerSectionsProps) {
  return (
    <>
      <GlassCard style={styles.card}>
        <Text style={styles.title}>{PROFILE_COPY.vehiclesTitle}</Text>
        {vehicles.length === 0 ? (
          <Text style={styles.muted}>{PROFILE_COPY.noVehicles}</Text>
        ) : (
          vehicles.map((v, i) => {
            const detail = vehicleDetail(v);
            return (
              <View key={`${vehicleTitle(v)}-${i}`} style={styles.vehicle}>
                <Text style={styles.vehicleName}>{vehicleTitle(v)}</Text>
                {detail ? <Text style={styles.muted}>{detail}</Text> : null}
              </View>
            );
          })
        )}
      </GlassCard>

      <GlassCard style={styles.card}>
        <Text style={styles.title}>{PROFILE_COPY.customerStatsTitle}</Text>
        <View style={styles.stats}>
          <StatPill
            label={`${PROFILE_COPY.rating}${totalRatingsCount ? ` (${totalRatingsCount})` : ""}`}
            value={formatRating(averageRating)}
          />
          <StatPill label={PROFILE_COPY.completedOrders} value={String(completedOrdersCount)} />
        </View>
      </GlassCard>
    </>
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
  vehicle: {
    gap: spacing.xxs,
  },
  vehicleName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
  muted: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  stats: {
    flexDirection: "row",
    gap: spacing.md,
  },
});
