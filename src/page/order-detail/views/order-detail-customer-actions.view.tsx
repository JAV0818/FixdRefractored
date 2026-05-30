// CustomerActions — the customer's status-aware actions on an order. View-tier:
// owns the customer-only hooks + side-effects (approve with the date picker,
// decline with confirm) and the passive "waiting" hints. The shared
// order-detail-success view renders this only when role === "customer", so the
// provider never mounts these hooks.

import { useCallback, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";

import { colors, fontSize, spacing } from "@/theme";
import { formatCurrency, formatDate } from "@/utils/format";
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
  const approveQuote = useApproveQuote();
  const declineQuote = useDeclineQuote();
  const isBusy = approveQuote.isPending || declineQuote.isPending;

  const [pickerOpen, setPickerOpen] = useState(false);
  const { customer, depositNote } = ORDER_DETAIL_COPY;

  const onPickDate = useCallback(
    (event: DateTimePickerEvent, date?: Date) => {
      setPickerOpen(false);
      if (event.type === "set" && date) {
        approveQuote.mutate({ orderId: order.id, scheduledAt: date.getTime() });
      }
    },
    [approveQuote, order.id],
  );

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

  if (order.status === "Pending") return <StatusHint text={customer.waitingMechanic} />;
  if (order.status === "Accepted") return <StatusHint text={customer.waitingQuote} />;
  if (order.status === "Scheduled" && order.scheduledAt) {
    return <StatusHint text={customer.scheduledFor(formatDate(order.scheduledAt))} />;
  }

  if (order.status === "QuoteProposed") {
    return (
      <View style={styles.actions}>
        <Text style={styles.depositNote}>{depositNote(formatCurrency(PLATFORM_DEPOSIT))}</Text>
        <Button mode="contained" onPress={() => setPickerOpen(true)} loading={isBusy} disabled={isBusy}>
          {customer.approve}
        </Button>
        <Button
          mode="contained"
          onPress={onDecline}
          disabled={isBusy}
          buttonColor={colors.danger}
          textColor={colors.onPrimary}
        >
          {customer.decline}
        </Button>
        {pickerOpen && (
          <DateTimePicker value={new Date()} mode="date" minimumDate={new Date()} onChange={onPickDate} />
        )}
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
