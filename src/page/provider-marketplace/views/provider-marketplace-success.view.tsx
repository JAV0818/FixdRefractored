import { useCallback, useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { useRouter } from "expo-router";

import { OrderListItem } from "@/components";
import { colors, fontSize, fontWeight, spacing } from "@/theme";
import { TAB_BAR_CLEARANCE } from "@/constants/layout";
import { formatCurrency, formatDate } from "@/utils/format";
import type { RepairOrder } from "@/types/order.interface";

import { MARKETPLACE_PAGE_SIZE, PROVIDER_MARKETPLACE_COPY } from "../provider-marketplace.constants";

type ProviderMarketplaceSuccessViewProps = {
  orders: RepairOrder[];
};

// A mechanic browsing the pool hasn't priced anything yet, so show the customer's
// rough estimate when present, else how long it's been waiting.
const trailingFor = (order: RepairOrder): string => {
  if (order.estimatedTotal > 0) return `~${formatCurrency(order.estimatedTotal)}`;
  return formatDate(order.createdAt);
};

export const ProviderMarketplaceSuccessView = ({ orders }: ProviderMarketplaceSuccessViewProps) => {
  const router = useRouter();

  // Reveal MARKETPLACE_PAGE_SIZE at a time. Below that threshold the whole pool
  // shows and the "load more" control never appears.
  const [visibleCount, setVisibleCount] = useState(MARKETPLACE_PAGE_SIZE);
  const visible = useMemo(() => orders.slice(0, visibleCount), [orders, visibleCount]);
  const hasMore = visibleCount < orders.length;

  const showMore = useCallback(
    () => setVisibleCount((count) => count + MARKETPLACE_PAGE_SIZE),
    [],
  );

  const openOrder = useCallback(
    (orderId: string) => {
      router.push({
        pathname: "/(provider-tabs)/marketplace/[orderId]",
        params: { orderId },
      });
    },
    [router],
  );

  if (orders.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>{PROVIDER_MARKETPLACE_COPY.emptyTitle}</Text>
        <Text style={styles.emptyBody}>{PROVIDER_MARKETPLACE_COPY.emptyBody}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={visible}
      keyExtractor={(order) => order.id}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      onEndReached={hasMore ? showMore : undefined}
      onEndReachedThreshold={0.4}
      renderItem={({ item }) => (
        <OrderListItem
          title={item.vehicleInfo}
          subtitle={item.description}
          status={item.status}
          trailing={trailingFor(item)}
          onPress={() => openOrder(item.id)}
        />
      )}
      ListFooterComponent={
        hasMore ? (
          <Button mode="outlined" onPress={showMore} style={styles.loadMore}>
            {PROVIDER_MARKETPLACE_COPY.loadMore}
          </Button>
        ) : null
      }
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: TAB_BAR_CLEARANCE,
  },
  loadMore: {
    marginTop: spacing.sm,
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
