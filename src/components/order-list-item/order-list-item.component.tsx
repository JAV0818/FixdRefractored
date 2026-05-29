// OrderListItem — a tappable summary row for an order, used by both the
// customer requests list and the provider queue. Dumb: all copy comes in as
// props; the status pill + tap are the only fixed structure.

import { memo } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

import { colors, fontSize, fontWeight, radii, spacing } from "@/theme";
import type { OrderStatus } from "@/types/order.interface";

import { OrderStatusBadge } from "../order-status-badge";

type OrderListItemProps = {
  title: string;
  subtitle: string;
  status: OrderStatus;
  trailing?: string;
  onPress: () => void;
};

export const OrderListItem = memo(function OrderListItem({
  title,
  subtitle,
  status,
  trailing,
  onPress,
}: OrderListItemProps) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <OrderStatusBadge status={status} />
        </View>
        <Text style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </Text>
        {!!trailing && <Text style={styles.trailing}>{trailing}</Text>}
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
  title: {
    flex: 1,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  trailing: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
});
