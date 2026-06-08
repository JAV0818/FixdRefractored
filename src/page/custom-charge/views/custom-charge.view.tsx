// Custom-charge view (mechanic). Lets the mechanic append extra line items to
// an InProgress order — work or parts not covered by the original quote. Shows
// the existing quote items read-only for context, then a live-editable form for
// new charges. Submits via addCustomCharges (Firestore transaction) so the
// running total stays consistent. Mirrors the quote-builder's local-state
// approach: values are strings while editing, parsed to numbers at submit.

import { useCallback, useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, HelperText, Text } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";

import { AppButton, AppCard, KeyboardSafeView } from "@/components";
import { colors, fontSize, fontWeight, radii, spacing } from "@/theme";
import { TAB_BAR_CLEARANCE } from "@/constants/layout";
import { formatCurrency } from "@/utils/format";
import { useOrder } from "@/hooks/use-order";
import { PLATFORM_DEPOSIT } from "@/services/order-service";
import type { OrderItem } from "@/types/order.interface";

import { CUSTOM_CHARGE_COPY } from "../custom-charge.constants";
import { LineItemRow } from "../components";
import { useAddCustomCharges } from "../hooks/use-add-custom-charges";

type LineItemDraft = { id: string; name: string; price: string; quantity: string };

const num = (value: string): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};
const qtyOf = (value: string): number => Math.max(1, Math.floor(num(value)) || 1);

export const CustomChargeView = () => {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { data: order, isLoading } = useOrder(orderId);
  const addCustomCharges = useAddCustomCharges();

  const idRef = useRef(0);
  const makeItem = useCallback(
    (): LineItemDraft => ({ id: String(++idRef.current), name: "", price: "", quantity: "1" }),
    [],
  );

  const [items, setItems] = useState<LineItemDraft[]>(() => [makeItem()]);

  const updateItem = useCallback((index: number, patch: Partial<LineItemDraft>) => {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }, []);
  const addItem = useCallback(() => setItems((prev) => [...prev, makeItem()]), [makeItem]);
  const removeItem = useCallback(
    (index: number) => setItems((prev) => prev.filter((_, i) => i !== index)),
    [],
  );

  const validItems = useMemo(
    () => items.filter((it) => it.name.trim() && num(it.price) > 0),
    [items],
  );

  const additionalEarnings = useMemo(
    () => validItems.reduce((sum, it) => sum + num(it.price) * qtyOf(it.quantity), 0),
    [validItems],
  );

  const originalTotal = order?.totalPrice ?? 0;
  const newTotal = originalTotal + additionalEarnings;

  const canSubmit =
    validItems.length > 0 && additionalEarnings > 0 && !addCustomCharges.isPending && !!orderId;

  const onSubmit = useCallback(() => {
    if (!orderId) return;
    const newItems: OrderItem[] = validItems.map((it) => ({
      name: it.name.trim(),
      description: null,
      price: num(it.price),
      quantity: qtyOf(it.quantity),
    }));
    addCustomCharges.mutate(
      { orderId, newItems },
      { onSuccess: () => router.back() },
    );
  }, [orderId, validItems, addCustomCharges, router]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator animating color={colors.primary} />
        <Text style={styles.muted}>{CUSTOM_CHARGE_COPY.loading}</Text>
      </View>
    );
  }
  if (!order) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>{CUSTOM_CHARGE_COPY.notFound}</Text>
      </View>
    );
  }

  return (
    <KeyboardSafeView contentContainerStyle={styles.content}>
      <View>
        <Text style={styles.vehicle}>{order.vehicleInfo}</Text>
        <Text style={styles.hint}>{CUSTOM_CHARGE_COPY.hint}</Text>
      </View>

      {order.items.length > 0 && (
        <AppCard>
          <Text style={styles.sectionLabel}>{CUSTOM_CHARGE_COPY.existingItems}</Text>
          {order.items.map((item, index) => (
            <View key={index} style={styles.existingRow}>
              <Text style={styles.existingName} numberOfLines={1}>
                {item.name}
                {item.quantity > 1 ? ` ×${item.quantity}` : ""}
              </Text>
              <Text style={styles.existingPrice}>
                {formatCurrency(item.price * item.quantity)}
              </Text>
            </View>
          ))}
        </AppCard>
      )}

      <Text style={styles.sectionLabel}>{CUSTOM_CHARGE_COPY.newItems}</Text>

      {items.map((item, index) => (
        <LineItemRow
          key={item.id}
          name={item.name}
          price={item.price}
          quantity={item.quantity}
          canRemove={items.length > 1}
          onChangeName={(v) => updateItem(index, { name: v })}
          onChangePrice={(v) => updateItem(index, { price: v })}
          onChangeQuantity={(v) => updateItem(index, { quantity: v })}
          onRemove={() => removeItem(index)}
        />
      ))}

      <AppButton variant="secondary" icon="plus" onPress={addItem}>
        {CUSTOM_CHARGE_COPY.addItem}
      </AppButton>

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{CUSTOM_CHARGE_COPY.originalTotal}</Text>
          <Text style={styles.summaryValue}>{formatCurrency(originalTotal)}</Text>
        </View>
        {additionalEarnings > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{CUSTOM_CHARGE_COPY.additionalCharges}</Text>
            <Text style={styles.summaryValue}>+{formatCurrency(additionalEarnings)}</Text>
          </View>
        )}
        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>{CUSTOM_CHARGE_COPY.newTotal}</Text>
          <Text style={styles.totalValue}>{formatCurrency(newTotal)}</Text>
        </View>
      </View>

      {addCustomCharges.isError && (
        <HelperText type="error" visible>
          {CUSTOM_CHARGE_COPY.submitError}
        </HelperText>
      )}

      <AppButton onPress={onSubmit} loading={addCustomCharges.isPending} disabled={!canSubmit}>
        {addCustomCharges.isPending ? CUSTOM_CHARGE_COPY.submitting : CUSTOM_CHARGE_COPY.submit}
      </AppButton>
    </KeyboardSafeView>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: TAB_BAR_CLEARANCE,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    padding: spacing.lg,
  },
  vehicle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  muted: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  existingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  existingName: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  existingPrice: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  summary: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceVariant,
    borderRadius: radii.lg,
    gap: spacing.xs,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.outline,
    marginVertical: spacing.xxs,
  },
  totalLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  totalValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
});
