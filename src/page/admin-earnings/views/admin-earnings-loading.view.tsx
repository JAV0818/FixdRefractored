// Skeleton for the Earnings dashboard — matches the success layout card shape.

import { ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

import { AppCard } from "@/components";
import { TAB_BAR_CLEARANCE } from "@/constants/layout";
import { colors, fontSize, fontWeight, spacing } from "@/theme";

import { ADMIN_EARNINGS_COPY } from "../admin-earnings.constants";

const placeholderMetric = "--";

export const AdminEarningsLoadingView = () => (
  <ScrollView
    contentContainerStyle={styles.content}
    showsVerticalScrollIndicator={false}
  >
    <ActivityIndicator animating color={colors.primary} />
    <Text variant="bodyMedium" style={styles.loadingLabel}>
      {ADMIN_EARNINGS_COPY.loading}
    </Text>
    <AppCard style={styles.card}>
      <Text style={styles.label}>{ADMIN_EARNINGS_COPY.platformFeesLabel}</Text>
      <Text style={styles.value}>{placeholderMetric}</Text>
    </AppCard>
    <AppCard style={styles.card}>
      <Text style={styles.label}>{ADMIN_EARNINGS_COPY.completedOrdersLabel}</Text>
      <Text style={styles.value}>{placeholderMetric}</Text>
    </AppCard>
    <AppCard style={styles.card}>
      <Text style={styles.label}>{ADMIN_EARNINGS_COPY.totalRevenueLabel}</Text>
      <Text style={styles.value}>{placeholderMetric}</Text>
    </AppCard>
    <AppCard style={styles.card}>
      <Text style={styles.label}>{ADMIN_EARNINGS_COPY.mechanicsTitle}</Text>
      <Text style={styles.placeholder}>{ADMIN_EARNINGS_COPY.mechanicPlaceholder}</Text>
    </AppCard>
  </ScrollView>
);

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: TAB_BAR_CLEARANCE,
  },
  loadingLabel: {
    textAlign: "center",
    color: colors.textSecondary,
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
});
