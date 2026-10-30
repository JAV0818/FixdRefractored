// CustomerActions — the customer's status-aware actions on an order. View-tier:
// owns the customer-only hooks + side-effects (approve / decline / cancel with
// confirm) and the passive "waiting" hints.

import { useCallback } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { useRouter } from "expo-router";

import { AppButton } from "@/components";
import { colors, fontSize, spacing } from "@/theme";
import { formatCurrency, formatDateTime } from "@/utils/format";
import { useAuthContext } from "@/providers/auth-provider";
import { PLATFORM_DEPOSIT, CANCELLATION_WINDOW_MS } from "@/services/order-service";
import type { RepairOrder } from "@/types/order.interface";

import { ORDER_DETAIL_COPY } from "../order-detail.constants";
import { useApproveQuote } from "../hooks/use-approve-quote";
import { useDeclineQuote } from "../hooks/use-decline-quote";
import { useCancelOrder } from "../hooks/use-cancel-order";
import { StatusHint } from "../components";

type CustomerActionsProps = {
  order: RepairOrder;
};

export const CustomerActions = ({ order }: CustomerActionsProps) => {
  const router = useRouter();
  const { currentUser } = useAuthContext();
  const approveQuote = useApproveQuote();
  const declineQuote = useDeclineQuote();
  const cancelOrder = useCancelOrder();
  const isBusy = approveQuote.isPending || declineQuote.isPending || cancelOrder.isPending;

  const { customer, depositNote } = ORDER_DETAIL_COPY;

  const onApprove = useCallback(() => approveQuote.mutate(order.id), [approveQuote, order.id]);

  const onMessageProvider = useCallback(() => {
    if (!order.providerId) return;
    router.push({
      pathname: "/(customer-tabs)/messages/[conversationId]",
      params: {
        conversationId: order.providerId,
        orderId: order.id,
      },
    });
  }, [order.providerId, order.id, router]);

  const onDecline = useCallback(() => {
    Alert.alert(customer.declineTitle, customer.declineBody, [
      { text: customer.keepQuote, style: "cancel" },
      {
        text: customer.declineConfirm,
        style: "destructive",
        onPress: () => declineQuote.mutate(order.id),
      },
    ]);
  }, [customer, declineQuote, order.id]);

  const onCancelService = useCallback(() => {
    if (!currentUser) return;
    const timeUntil = (order.scheduledAt ?? 0) - Date.now();
    const isFree = timeUntil >= CANCELLATION_WINDOW_MS;
    const body = isFree ? customer.cancelBodyFree : customer.cancelBodyCharged;

    Alert.alert(customer.cancelTitle, body, [
      { text: customer.keepService, style: "cancel" },
      {
        text: customer.cancelConfirm,
        style: "destructive",
        onPress: () =>
          cancelOrder.mutate({
            orderId: order.id,
            cancelledBy: currentUser.id,
            reason: "customer_cancelled",
          }),
      },
    ]);
  }, [customer, cancelOrder, currentUser, order.id, order.scheduledAt]);

  if (order.status === "Pending") return <StatusHint text={customer.waitingMechanic} />;
  if (order.status === "Accepted") return <StatusHint text={customer.waitingQuote} />;

  if (order.status === "Scheduled" && order.scheduledAt) {
    return (
      <View style={styles.actions}>
        <StatusHint text={customer.scheduledFor(formatDateTime(order.scheduledAt))} />
        <AppButton variant="secondary" onPress={onMessageProvider}>
          {customer.messageProvider}
        </AppButton>
        <AppButton variant="danger" onPress={onCancelService} loading={cancelOrder.isPending} disabled={isBusy}>
          {customer.cancelService}
        </AppButton>
      </View>
    );
  }

  if (order.status === "InProgress" || order.status === "Completed") {
    return (
      <View style={styles.actions}>
        <AppButton variant="secondary" onPress={onMessageProvider}>
          {customer.messageProvider}
        </AppButton>
      </View>
    );
  }

  if (order.status === "QuoteProposed") {
    return (
      <View style={styles.actions}>
        <Text style={styles.depositNote}>{depositNote(formatCurrency(PLATFORM_DEPOSIT))}</Text>
        <AppButton onPress={onApprove} loading={approveQuote.isPending} disabled={isBusy}>
          {customer.approve}
        </AppButton>
        <AppButton variant="danger" onPress={onDecline} disabled={isBusy}>
          {customer.decline}
        </AppButton>
        <AppButton variant="secondary" onPress={onMessageProvider} disabled={isBusy}>
          {customer.messageProvider}
        </AppButton>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  actions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  depositNote: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
