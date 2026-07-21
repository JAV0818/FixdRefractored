// CustomerActions — the customer's status-aware actions on an order. View-tier:
// owns the customer-only hooks + side-effects (approve / decline with confirm)
// and the passive "waiting" hints. The appointment time was already agreed
// (customer requested it, mechanic confirmed it in the quote), so approval just
// books it — no date picker here.

import { useCallback } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { useRouter } from "expo-router";

import { AppButton } from "@/components";
import { colors, fontSize, spacing } from "@/theme";
import { formatCurrency, formatDateTime } from "@/utils/format";
import { PLATFORM_DEPOSIT } from "@/services/order-service";
import type { RepairOrder } from "@/types/order.interface";

import { ORDER_DETAIL_COPY } from "../order-detail.constants";
import { useApproveQuote } from "../hooks/use-approve-quote";
import { useDeclineQuote } from "../hooks/use-decline-quote";
import { StatusHint } from "../components";

type CustomerActionsProps = {
  order: RepairOrder;
};

export const CustomerActions = ({ order }: CustomerActionsProps) => {
  const router = useRouter();
  const approveQuote = useApproveQuote();
  const declineQuote = useDeclineQuote();
  const isBusy = approveQuote.isPending || declineQuote.isPending;

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
      { text: customer.cancel, style: "cancel" },
      {
        text: customer.declineConfirm,
        style: "destructive",
        onPress: () => declineQuote.mutate(order.id),
      },
    ]);
  }, [customer, declineQuote, order.id]);

  const onPayDeposit = useCallback(() => {
    router.push({
      pathname: "/(customer-tabs)/requests/[orderId]/payment",
      params: { orderId: order.id },
    });
  }, [router, order.id]);

  if (order.status === "Pending") return <StatusHint text={customer.waitingMechanic} />;
  if (order.status === "Accepted") return <StatusHint text={customer.waitingQuote} />;
  if (order.status === "Scheduled" && order.scheduledAt) {
    return (
      <View style={styles.actions}>
        <StatusHint text={customer.scheduledFor(formatDateTime(order.scheduledAt))} />
        <AppButton variant="secondary" onPress={onMessageProvider}>
          {customer.messageProvider}
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
        {order.paymentStatus === "pending" ? (
          <AppButton onPress={onPayDeposit} disabled={isBusy}>
            {customer.payDeposit}
          </AppButton>
        ) : (
          <AppButton onPress={onApprove} loading={isBusy} disabled={isBusy}>
            {customer.approve}
          </AppButton>
        )}
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
