// ProviderActions — the mechanic's status-aware actions on an order. View-tier:
// owns the provider-only hook + side-effect (accept a Pending job, navigate to
// the quote builder). The shared order-detail-success view renders this only
// when role === "provider", so the customer never mounts the accept hook.

import { useCallback } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button } from "react-native-paper";
import { useRouter } from "expo-router";

import { useAuthContext } from "@/providers/auth-provider";
import { spacing } from "@/theme";
import type { RepairOrder } from "@/types/order.interface";

import { ORDER_DETAIL_COPY } from "../order-detail.constants";
import { useAcceptOrder } from "../hooks/use-accept-order";
import { StatusHint } from "../components";

type ProviderActionsProps = {
  order: RepairOrder;
};

export const ProviderActions = ({ order }: ProviderActionsProps) => {
  const router = useRouter();
  const { currentUser } = useAuthContext();
  const isOwner = !!order.providerId && order.providerId === currentUser?.id;

  const acceptOrder = useAcceptOrder();
  const { provider } = ORDER_DETAIL_COPY;

  // Surface the claim-conflict (two mechanics race for one order): orderService
  // .acceptOrder throws when the order is no longer Pending. The onSuccess
  // invalidations refresh the pool so the now-claimed order drops off.
  const onAccept = useCallback(() => {
    acceptOrder.mutate(order.id, {
      onError: (error) => {
        Alert.alert(
          provider.acceptErrorTitle,
          error instanceof Error ? error.message : provider.acceptErrorFallback,
        );
      },
    });
  }, [acceptOrder, order.id, provider]);

  const onBuildQuote = useCallback(() => {
    router.push({
      pathname: "/(provider-tabs)/queue/quote-builder",
      params: { orderId: order.id },
    });
  }, [router, order.id]);

  if (order.status === "Pending") {
    return (
      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={onAccept}
          loading={acceptOrder.isPending}
          disabled={acceptOrder.isPending}
        >
          {provider.accept}
        </Button>
      </View>
    );
  }

  if (order.status === "Accepted" && isOwner) {
    return (
      <View style={styles.actions}>
        <Button mode="contained" onPress={onBuildQuote}>
          {provider.buildQuote}
        </Button>
      </View>
    );
  }

  if (order.status === "QuoteProposed" && isOwner) {
    return <StatusHint text={provider.waitingApproval} />;
  }

  return null;
};

const styles = StyleSheet.create({
  actions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
