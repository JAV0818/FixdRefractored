// OrderStatusBadge — a colored pill for an order's lifecycle status. App-wide:
// used by the requests list, the provider queue, and order detail.

import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { colors, fontSize, fontWeight, radii, spacing } from "@/theme";
import type { OrderStatus } from "@/types/order.interface";

type StatusMeta = { label: string; bg: string; fg: string };

const STATUS_META: Record<OrderStatus, StatusMeta> = {
  Pending: { label: "Pending", bg: colors.surfaceVariant, fg: colors.textSecondary },
  Accepted: { label: "Accepted", bg: colors.surfaceVariant, fg: colors.primary },
  QuoteProposed: { label: "Quote ready", bg: colors.primary, fg: colors.onPrimary },
  Scheduled: { label: "Scheduled", bg: colors.surfaceVariant, fg: colors.primary },
  InProgress: { label: "In progress", bg: colors.primary, fg: colors.onPrimary },
  Completed: { label: "Completed", bg: colors.success, fg: colors.onPrimary },
  Expired: { label: "Expired", bg: colors.surfaceVariant, fg: colors.textDisabled },
  Cancelled: { label: "Cancelled", bg: colors.surfaceVariant, fg: colors.danger },
};

type OrderStatusBadgeProps = {
  status: OrderStatus;
};

export const OrderStatusBadge = memo(function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const meta = STATUS_META[status];
  return (
    <View style={[styles.badge, { backgroundColor: meta.bg }]}>
      <Text style={[styles.label, { color: meta.fg }]}>{meta.label}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radii.full,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
});
