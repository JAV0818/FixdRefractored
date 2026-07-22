// Customer deposit payment view. Loads the order, shows the vehicle + quote
// summary, collects card details via Stripe CardField, and confirms the
// PaymentIntent when the user taps the primary CTA.

import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, HelperText, Text } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";

import { AppButton, GlassCard, KeyboardSafeView } from "@/components";
import { colors, fontSize, fontWeight, spacing } from "@/theme";
import { TAB_BAR_CLEARANCE } from "@/constants/layout";
import { formatCurrency } from "@/utils/format";
import { useOrder } from "@/hooks/use-order";
import { orderService, PLATFORM_DEPOSIT } from "@/services/order-service";
import { CardField, paymentService } from "@/services/payment-service";

import { PAYMENT_COPY } from "../payment.constants";
import { useCreatePaymentIntent } from "../hooks/use-create-payment-intent";

export const PaymentView = () => {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { data: order, isLoading, isError, refetch } = useOrder(orderId);
  const createPaymentIntent = useCreatePaymentIntent();

  const [isConfirming, setIsConfirming] = useState(false);
  const [paymentError, setPaymentError] = useState<Error | null>(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const isPending = createPaymentIntent.isPending || isConfirming;

  const onPreparePayment = () => {
    if (!orderId || isPending) return;
    setPaymentError(null);

    createPaymentIntent.mutate(orderId, {
      onSuccess: (intent) => setClientSecret(intent.clientSecret),
    });
  };

  const onPayDeposit = async () => {
    if (!orderId || !clientSecret || isConfirming) return;
    setIsConfirming(true);
    setPaymentError(null);

    try {
      await paymentService.confirmStripePayment(clientSecret);
      await orderService.markDepositAuthorized(orderId);
      router.back();
    } catch (err) {
      setPaymentError(err instanceof Error ? err : new Error("Payment failed"));
    } finally {
      setIsConfirming(false);
    }
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

      {clientSecret ? (
        <GlassCard>
          <Text style={styles.sectionLabel}>{PAYMENT_COPY.cardLabel}</Text>
          <CardField
            postalCodeEnabled={false}
            placeholders={{ number: "4242 4242 4242 4242" }}
            cardStyle={cardFieldStyle}
            style={styles.cardFieldContainer}
            onCardChange={(cardDetails) => setCardComplete(cardDetails.complete)}
          />
        </GlassCard>
      ) : null}

      {paymentError && (
        <HelperText type="error" visible style={styles.errorText}>
          {PAYMENT_COPY.confirmPaymentError}
          {"\n"}
          {paymentError.message}
        </HelperText>
      )}

      {clientSecret ? (
        <AppButton
          onPress={onPayDeposit}
          loading={isConfirming}
          disabled={isConfirming || !cardComplete}
        >
          {isConfirming ? PAYMENT_COPY.processing : PAYMENT_COPY.payDepositButton}
        </AppButton>
      ) : (
        <AppButton onPress={onPreparePayment} loading={isPending} disabled={isPending}>
          {PAYMENT_COPY.enterCard}
        </AppButton>
      )}
    </KeyboardSafeView>
  );
};

const cardFieldStyle = {
  backgroundColor: colors.surface,
  textColor: colors.textPrimary,
  borderRadius: 8,
  fontSize: 16,
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
  cardFieldContainer: {
    height: 50,
    marginVertical: spacing.sm,
  },
});
