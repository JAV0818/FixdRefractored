import { useCallback } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { useRouter } from "expo-router";

import { OrderListItem } from "@/components";
import { colors, fontSize, fontWeight, spacing } from "@/theme";
import { TAB_BAR_CLEARANCE } from "@/constants/layout";
import { formatCurrency, formatDate } from "@/utils/format";
import type { RepairOrder } from "@/types/order.interface";

import { PROVIDER_QUEUE_COPY } from "../provider-queue.constants";

type ProviderQueueSuccessViewProps = {
  mine: RepairOrder[];
};

const trailingFor = (order: RepairOrder): string => {
  if (order.totalPrice > 0) return formatCurrency(order.totalPrice);
  if (order.estimatedTotal > 0) return `~${formatCurrency(order.estimatedTotal)}`;
  return formatDate(order.createdAt);
};

export const ProviderQueueSuccessView = ({ mine }: ProviderQueueSuccessViewProps) => {
  const router = useRouter();

  const openOrder = useCallback(
    (orderId: string) => {
      router.push({
        pathname: "/(provider-tabs)/queue/[orderId]",
        params: { orderId },
      });
    },
    [router],
  );

  if (mine.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>{PROVIDER_QUEUE_COPY.emptyTitle}</Text>
        <Text style={styles.emptyBody}>{PROVIDER_QUEUE_COPY.emptyBody}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={mine}
      keyExtractor={(order) => order.id}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <OrderListItem
          title={item.vehicleInfo}
          subtitle={item.description}
          status={item.status}
          trailing={trailingFor(item)}
          onPress={() => openOrder(item.id)}
        />
      )}
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
