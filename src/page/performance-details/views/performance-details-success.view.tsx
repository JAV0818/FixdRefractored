// PerformanceDetailsSuccessView — all-time stats, monthly earnings stub, and
// recent completed orders list. The monthly table is empty until M10 Cloud
// Functions populate analytics/mechanics/{uid}.

import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { AppCard, KeyboardSafeView, OrderListItem } from "@/components";
import { colors, fontSize, fontWeight, spacing } from "@/theme";
import { StatTile } from "@/page/profile/components";
import { formatMoney, formatRating } from "@/page/profile/utils/profile-format";
import { PLATFORM_DEPOSIT } from "@/services/order-service";
import type { ProviderDetails } from "@/types/user.interface";
import type { RepairOrder } from "@/types/order.interface";

import { PERFORMANCE_COPY } from "../performance-details.constants";

type PerformanceDetailsSuccessViewProps = {
  provider: ProviderDetails;
  completedOrders: RepairOrder[];
};

export const PerformanceDetailsSuccessView = ({
  provider,
  completedOrders,
}: PerformanceDetailsSuccessViewProps) => (
  <KeyboardSafeView contentContainerStyle={styles.content}>
    {/* All-time summary */}
    <AppCard style={styles.card}>
      <Text style={styles.sectionTitle}>{PERFORMANCE_COPY.summaryTitle}</Text>
      <View style={styles.statsRow}>
        <StatTile label={PERFORMANCE_COPY.totalJobs} value={String(provider.totalJobsCompleted)} />
        <StatTile label={PERFORMANCE_COPY.avgRating} value={formatRating(provider.averageRating)} />
        <StatTile label={PERFORMANCE_COPY.totalEarnings} value={formatMoney(provider.totalEarnings)} />
      </View>
    </AppCard>

    {/* Monthly breakdown — stub until M10 */}
    <AppCard style={styles.card}>
      <Text style={styles.sectionTitle}>{PERFORMANCE_COPY.monthlyTitle}</Text>
      <Text style={styles.muted}>{PERFORMANCE_COPY.monthlyComingSoon}</Text>
    </AppCard>

    {/* Recent completed jobs */}
    <AppCard style={styles.card}>
      <Text style={styles.sectionTitle}>{PERFORMANCE_COPY.recentTitle}</Text>
      {completedOrders.length === 0 ? (
        <Text style={styles.muted}>{PERFORMANCE_COPY.noCompletedJobs}</Text>
      ) : (
        <View style={styles.orderList}>
          {completedOrders.map((order) => (
            <OrderListItem
              key={order.id}
              title={order.customerName ?? "Customer"}
              subtitle={order.description}
              status={order.status}
              trailing={PERFORMANCE_COPY.earned(formatMoney(order.totalPrice - PLATFORM_DEPOSIT))}
              onPress={() => {}}
            />
          ))}
        </View>
      )}
    </AppCard>
  </KeyboardSafeView>
);

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  card: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  muted: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  orderList: {
    gap: spacing.sm,
  },
});
