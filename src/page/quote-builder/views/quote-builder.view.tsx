// Quote-builder view (mechanic). A dynamic line-item form with a live total.
// Line items are computed financial inputs, so this uses local state rather
// than RHF; values are parsed to numbers at submit. On send → proposeQuote,
// which moves the order to QuoteProposed and opens the approval window.

import { useCallback, useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, HelperText, Text, TextInput } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";

import { KeyboardSafeView } from "@/components";
import { colors, fontSize, fontWeight, radii, spacing } from "@/theme";
import { formatCurrency } from "@/utils/format";
import { useOrder } from "@/hooks/use-order";
import type { OrderItem } from "@/types/order.interface";

import { QUOTE_BUILDER_COPY } from "../quote-builder.constants";
import { LineItemRow } from "../components";
import { useProposeQuote } from "../hooks/use-propose-quote";

type LineItemDraft = { id: string; name: string; price: string; quantity: string };

const num = (value: string): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};
const qtyOf = (value: string): number => Math.max(1, Math.floor(num(value)) || 1);

export const QuoteBuilderView = () => {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { data: order, isLoading } = useOrder(orderId);
  const proposeQuote = useProposeQuote();

  const idRef = useRef(0);
  const makeItem = useCallback(
    (): LineItemDraft => ({ id: String(++idRef.current), name: "", price: "", quantity: "1" }),
    [],
  );

  const [items, setItems] = useState<LineItemDraft[]>(() => [makeItem()]);
  const [labor, setLabor] = useState("");
  const [parts, setParts] = useState("");

  const updateItem = useCallback((index: number, patch: Partial<LineItemDraft>) => {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }, []);
  const addItem = useCallback(() => setItems((prev) => [...prev, makeItem()]), [makeItem]);
  const removeItem = useCallback(
    (index: number) => setItems((prev) => prev.filter((_, i) => i !== index)),
    [],
  );

  // Only named, priced rows are submitted — compute the total from that SAME set
  // so the shown/charged total always matches the line items the customer sees.
  const validItems = useMemo(
    () => items.filter((it) => it.name.trim() && num(it.price) > 0),
    [items],
  );
  const total = useMemo(
    () =>
      validItems.reduce((sum, it) => sum + num(it.price) * qtyOf(it.quantity), 0) +
      num(labor) +
      num(parts),
    [validItems, labor, parts],
  );

  const canSubmit = validItems.length > 0 && total > 0 && !proposeQuote.isPending && !!orderId;

  const onSubmit = useCallback(() => {
    if (!orderId) return;
    const orderItems: OrderItem[] = validItems.map((it) => ({
      name: it.name.trim(),
      description: null,
      price: num(it.price),
      quantity: qtyOf(it.quantity),
    }));
    proposeQuote.mutate(
      {
        orderId,
        items: orderItems,
        laborCost: num(labor),
        partsCost: num(parts),
        totalPrice: total,
      },
      { onSuccess: () => router.back() },
    );
  }, [orderId, validItems, labor, parts, total, proposeQuote, router]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator animating color={colors.primary} />
        <Text style={styles.muted}>{QUOTE_BUILDER_COPY.loading}</Text>
      </View>
    );
  }
  if (!order) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>{QUOTE_BUILDER_COPY.notFound}</Text>
      </View>
    );
  }

  return (
    <KeyboardSafeView contentContainerStyle={styles.content}>
      <View>
        <Text style={styles.vehicle}>{order.vehicleInfo}</Text>
        <Text style={styles.muted}>{order.description}</Text>
      </View>
      <Text style={styles.hint}>{QUOTE_BUILDER_COPY.hint}</Text>

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

      <Button mode="outlined" icon="plus" onPress={addItem}>
        {QUOTE_BUILDER_COPY.addItem}
      </Button>

      <TextInput
        label={QUOTE_BUILDER_COPY.laborLabel}
        value={labor}
        onChangeText={setLabor}
        mode="outlined"
        keyboardType="decimal-pad"
        style={styles.cost}
        outlineColor={colors.outline}
        activeOutlineColor={colors.primary}
      />
      <TextInput
        label={QUOTE_BUILDER_COPY.partsLabel}
        value={parts}
        onChangeText={setParts}
        mode="outlined"
        keyboardType="decimal-pad"
        style={styles.cost}
        outlineColor={colors.outline}
        activeOutlineColor={colors.primary}
      />

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>{QUOTE_BUILDER_COPY.total}</Text>
        <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
      </View>

      {proposeQuote.isError && (
        <HelperText type="error" visible>
          {QUOTE_BUILDER_COPY.submitError}
        </HelperText>
      )}

      <Button
        mode="contained"
        onPress={onSubmit}
        loading={proposeQuote.isPending}
        disabled={!canSubmit}
      >
        {proposeQuote.isPending ? QUOTE_BUILDER_COPY.submitting : QUOTE_BUILDER_COPY.submit}
      </Button>
    </KeyboardSafeView>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.md,
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
  muted: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  cost: {
    backgroundColor: colors.surface,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceVariant,
    borderRadius: radii.lg,
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
