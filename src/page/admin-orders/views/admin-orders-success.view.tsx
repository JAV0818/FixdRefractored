import { memo, useCallback } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { useRouter } from "expo-router";

import { OrderListItem } from "@/components";
import { TAB_BAR_CLEARANCE } from "@/constants/layout";
import { colors, fontSize, fontWeight, spacing } from "@/theme";
import { formatCurrency, formatDate } from "@/utils/format";
import type { RepairOrder } from "@/types/order.interface";

import { ADMIN_ORDERS_COPY } from "../admin-orders.constants";

type AdminOrdersSuccessViewProps = {
  orders: RepairOrder[];
};

const trailingFor = (order: RepairOrder): string => {
  if (order.totalPrice > 0) return formatCurrency(order.totalPrice);
  if (order.estimatedTotal > 0) return `~${formatCurrency(order.estimatedTotal)}`;
  return formatDate(order.createdAt);
};

type AdminOrderRowProps = {
  item: RepairOrder;
  onPress: (orderId: string) => void;
};

const AdminOrderRow = memo(function AdminOrderRow({ item, onPress }: AdminOrderRowProps) {
  const handlePress = useCallback(() => onPress(item.id), [onPress, item.id]);
  return (
    <OrderListItem
      title={item.vehicleInfo}
      subtitle={item.description}
      status={item.status}
      trailing={trailingFor(item)}
      onPress={handlePress}
    />
  );
});

export const AdminOrdersSuccessView = ({ orders }: AdminOrdersSuccessViewProps) => {
  const router = useRouter();

  const openOrder = useCallback(
    (orderId: string) => {
      router.push({
        pathname: "/(admin-tabs)/orders/[orderId]",
        params: { orderId },
      });
    },
    [router],
  );

  if (orders.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>{ADMIN_ORDERS_COPY.emptyTitle}</Text>
        <Text style={styles.emptyBody}>{ADMIN_ORDERS_COPY.emptyBody}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(order) => order.id}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => <AdminOrderRow item={item} onPress={openOrder} />}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: TAB_BAR_CLEARANCE,
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
});
