// Success state for the Earnings dashboard. Handles the empty-data sub-state
// inline and shows placeholders for the metrics M10 will populate.

import { ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { AppCard } from "@/components";
import { TAB_BAR_CLEARANCE } from "@/constants/layout";
import { colors, fontSize, fontWeight, spacing } from "@/theme";
import { formatCurrency } from "@/utils/format";

import { ADMIN_EARNINGS_COPY } from "../admin-earnings.constants";
import type { DailyAnalytics } from "../hooks/use-analytics";

type AdminEarningsSuccessViewProps = {
  analytics: DailyAnalytics | undefined;
};

export const AdminEarningsSuccessView = ({ analytics }: AdminEarningsSuccessViewProps) => {
  if (!analytics) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>{ADMIN_EARNINGS_COPY.emptyTitle}</Text>
        <Text style={styles.emptyBody}>{ADMIN_EARNINGS_COPY.emptyBody}</Text>
      </View>
    );
  }

  const mechanicEntries = Object.entries(analytics.ordersByMechanic);

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <AppCard style={styles.card}>
        <Text style={styles.label}>{ADMIN_EARNINGS_COPY.platformFeesLabel}</Text>
        <Text style={styles.value}>{formatCurrency(analytics.platformFees)}</Text>
      </AppCard>
      <AppCard style={styles.card}>
        <Text style={styles.label}>{ADMIN_EARNINGS_COPY.completedOrdersLabel}</Text>
        <Text style={styles.value}>{analytics.completedOrders}</Text>
      </AppCard>
      <AppCard style={styles.card}>
        <Text style={styles.label}>{ADMIN_EARNINGS_COPY.totalRevenueLabel}</Text>
        <Text style={styles.value}>{formatCurrency(analytics.totalRevenue)}</Text>
      </AppCard>
      <AppCard style={styles.card}>
        <Text style={styles.label}>{ADMIN_EARNINGS_COPY.mechanicsTitle}</Text>
        {mechanicEntries.length === 0 ? (
          <Text style={styles.placeholder}>{ADMIN_EARNINGS_COPY.mechanicPlaceholder}</Text>
        ) : (
          <View style={styles.table}>
            {mechanicEntries.map(([providerId, stats]) => (
              <View key={providerId} style={styles.row}>
                <Text style={styles.mechanicId} numberOfLines={1}>
                  {providerId}
                </Text>
                <Text style={styles.earnings}>{formatCurrency(stats.earnings)}</Text>
              </View>
            ))}
          </View>
        )}
      </AppCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: TAB_BAR_CLEARANCE,
  },
  card: {
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  value: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  placeholder: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  emptyBody: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: "center",
  },
  table: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
  },
  mechanicId: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  earnings: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
});
