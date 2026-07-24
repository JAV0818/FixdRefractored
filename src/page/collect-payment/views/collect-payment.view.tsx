// Provider collect-payment view. Shows the remaining balance for an order and
// lets the provider record that the customer paid cash.

import { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, HelperText, Text } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";

import { AppButton, GlassCard, KeyboardSafeView } from "@/components";
import { colors, fontSize, fontWeight, spacing } from "@/theme";
import { formatCurrency } from "@/utils/format";
import { useOrder } from "@/hooks/use-order";

import { useRecordCashPayment } from "../hooks/use-record-cash-payment";
import { COLLECT_PAYMENT_COPY } from "../collect-payment.constants";

export const CollectPaymentView = () => {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { data: order, isLoading } = useOrder(orderId);
  const recordCashPayment = useRecordCashPayment();

  const isPaymentBlocked = order?.status === "InProgress" && !order?.inspectionCompletedAt;

  const onRecordPayment = useCallback(() => {
    if (!orderId || !order || isPaymentBlocked) return;
    recordCashPayment.mutate(
      { orderId, amount: order.remainingBalance },
      { onSuccess: () => router.back() },
    );
  }, [orderId, order, isPaymentBlocked, recordCashPayment, router]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator animating color={colors.primary} />
        <Text style={styles.muted}>{COLLECT_PAYMENT_COPY.loading}</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>{COLLECT_PAYMENT_COPY.notFound}</Text>
      </View>
    );
  }

  return (
    <KeyboardSafeView contentContainerStyle={styles.content} scrollable={false}>
      <GlassCard>
        <Text style={styles.vehicle}>{order.vehicleInfo}</Text>
        <Text style={styles.label}>{COLLECT_PAYMENT_COPY.remainingBalanceLabel}</Text>
        <Text style={styles.balance}>{formatCurrency(order.remainingBalance)}</Text>
      </GlassCard>

      {isPaymentBlocked && (
        <HelperText type="info" visible>
          {COLLECT_PAYMENT_COPY.inspectionRequiredHint}
        </HelperText>
      )}

      {recordCashPayment.isError && (
        <HelperText type="error" visible>
          {recordCashPayment.error?.message || COLLECT_PAYMENT_COPY.errorFallback}
        </HelperText>
      )}

      <AppButton
        onPress={onRecordPayment}
        loading={recordCashPayment.isPending}
        disabled={isPaymentBlocked || recordCashPayment.isPending}
      >
        {recordCashPayment.isPending
          ? COLLECT_PAYMENT_COPY.recording
          : COLLECT_PAYMENT_COPY.recordCashPayment}
      </AppButton>
    </KeyboardSafeView>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    padding: spacing.lg,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
    justifyContent: "center",
  },
  vehicle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.glassText,
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.glassTextMuted,
  },
  balance: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.glassText,
  },
  muted: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
