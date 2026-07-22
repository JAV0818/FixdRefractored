// Customer deposit payment view. Loads the order, shows the vehicle + quote
// summary, and chains create-payment-intent → confirm-payment when the user
// taps the primary CTA.

import { StyleSheet, View } from "react-native";
import { ActivityIndicator, HelperText, Text } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";

import { AppButton, GlassCard, KeyboardSafeView } from "@/components";
import { colors, fontSize, fontWeight, spacing } from "@/theme";
import { TAB_BAR_CLEARANCE } from "@/constants/layout";
import { formatCurrency } from "@/utils/format";
import { useOrder } from "@/hooks/use-order";
import { PLATFORM_DEPOSIT } from "@/services/order-service";

import { PAYMENT_COPY } from "../payment.constants";
import { useConfirmPayment } from "../hooks/use-confirm-payment";
import { useCreatePaymentIntent } from "../hooks/use-create-payment-intent";

export const PaymentView = () => {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { data: order, isLoading, isError, refetch } = useOrder(orderId);
  const createPaymentIntent = useCreatePaymentIntent();
  const confirmPayment = useConfirmPayment();

  const isPending = createPaymentIntent.isPending || confirmPayment.isPending;
  const paymentError = createPaymentIntent.error ?? confirmPayment.error;

  const onPayDeposit = () => {
    if (!orderId || isPending) return;

    createPaymentIntent.mutate(orderId, {
      onSuccess: (intent) => {
        confirmPayment.mutate(intent.clientSecret, {
          onSuccess: () => router.back(),
        });
      },
    });
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator animating color={colors.primary} />
        <Text style={styles.muted}>{PAYMENT_COPY.loadingOrder}</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>{PAYMENT_COPY.loadError}</Text>
        <AppButton onPress={refetch}>{PAYMENT_COPY.retry}</AppButton>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>{PAYMENT_COPY.notFound}</Text>
      </View>
    );
  }

  return (
    <KeyboardSafeView contentContainerStyle={styles.content}>
      <GlassCard>
        <Text style={styles.sectionLabel}>{PAYMENT_COPY.vehicleLabel}</Text>
        <Text style={styles.vehicle}>{order.vehicleInfo}</Text>
      </GlassCard>

      <GlassCard>
        <View style={styles.row}>
          <Text style={styles.summaryLabel}>{PAYMENT_COPY.totalLabel}</Text>
          <Text style={styles.summaryValue}>{formatCurrency(order.totalPrice)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.summaryLabel}>{PAYMENT_COPY.depositLabel}</Text>
          <Text style={styles.depositValue}>{formatCurrency(PLATFORM_DEPOSIT)}</Text>
        </View>
      </GlassCard>

      {paymentError && (
        <HelperText type="error" visible style={styles.errorText}>
          {createPaymentIntent.error ? PAYMENT_COPY.createIntentError : PAYMENT_COPY.confirmPaymentError}
          {"\n"}
          {paymentError.message}
        </HelperText>
      )}

      <AppButton onPress={onPayDeposit} loading={isPending} disabled={isPending}>
        {isPending ? PAYMENT_COPY.processing : PAYMENT_COPY.payDepositButton}
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
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: TAB_BAR_CLEARANCE,
  },
  depositValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  muted: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.glassTextMuted,
  },
  summaryLabel: {
    fontSize: fontSize.base,
    color: colors.glassText,
  },
  summaryValue: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.glassText,
  },
  vehicle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.glassText,
  },
  errorText: {
    textAlign: "center",
  },
});
