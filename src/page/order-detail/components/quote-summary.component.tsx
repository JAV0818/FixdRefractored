// QuoteSummary — the priced line items + cost breakdown for a proposed quote.
// Dumb: receives the already-computed numbers and renders them.

import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { colors, fontSize, fontWeight, spacing } from "@/theme";
import { formatCurrency } from "@/utils/format";
import type { OrderItem } from "@/types/order.interface";

type QuoteSummaryProps = {
  items: OrderItem[];
  laborCost: number;
  partsCost: number;
  totalPrice: number;
  depositAmount: number;
};

export const QuoteSummary = memo(function QuoteSummary({
  items,
  laborCost,
  partsCost,
  totalPrice,
  depositAmount,
}: QuoteSummaryProps) {
  return (
    <View style={styles.wrap}>
      {items.map((item, i) => (
        <Row
          key={`${item.name}-${i}`}
          label={item.quantity > 1 ? `${item.name} ×${item.quantity}` : item.name}
          value={formatCurrency(item.price * item.quantity)}
        />
      ))}

      {laborCost > 0 && <Row label="Labor" value={formatCurrency(laborCost)} />}
      {partsCost > 0 && <Row label="Parts" value={formatCurrency(partsCost)} />}

      {/* The line items are the mechanic's charge; the $20 booking deposit is
          added on top, so items + deposit = total (the deposit is part of it). */}
      <Row label="Booking deposit" value={formatCurrency(depositAmount)} muted />
      <View style={styles.divider} />
      <Row label="Total" value={formatCurrency(totalPrice)} emphasized />
    </View>
  );
});

type RowProps = { label: string; value: string; emphasized?: boolean; muted?: boolean };

const Row = ({ label, value, emphasized, muted }: RowProps) => (
  <View style={styles.row}>
    <Text style={[styles.label, emphasized && styles.strong, muted && styles.muted]}>{label}</Text>
    <Text style={[styles.value, emphasized && styles.strong, muted && styles.muted]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  value: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  strong: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  muted: {
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.outline,
    marginVertical: spacing.xs,
  },
});
