// LineItemRow — one editable quote line (name, price, qty) with a remove
// button. Dumb: values are strings (raw input), parsed by the view at submit.

import { memo } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { TextInput } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

import { colors, radii, spacing } from "@/theme";

import { MECHANIC_CUSTOM_QUOTE_COPY } from "../mechanic-custom-quote.constants";

type LineItemRowProps = {
  canRemove: boolean;
  name: string;
  price: string;
  quantity: string;
  onChangeName: (value: string) => void;
  onChangePrice: (value: string) => void;
  onChangeQuantity: (value: string) => void;
  onRemove: () => void;
};

export const LineItemRow = memo(function LineItemRow({
  canRemove,
  name,
  price,
  quantity,
  onChangeName,
  onChangePrice,
  onChangeQuantity,
  onRemove,
}: LineItemRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.fields}>
        <TextInput
          label={MECHANIC_CUSTOM_QUOTE_COPY.itemNamePlaceholder}
          value={name}
          onChangeText={onChangeName}
          mode="outlined"
          dense
          style={styles.name}
          outlineColor={colors.outline}
          activeOutlineColor={colors.primary}
        />
        <View style={styles.numbers}>
          <TextInput
            label={MECHANIC_CUSTOM_QUOTE_COPY.pricePlaceholder}
            value={price}
            onChangeText={onChangePrice}
            mode="outlined"
            dense
            keyboardType="decimal-pad"
            style={styles.price}
            outlineColor={colors.outline}
            activeOutlineColor={colors.primary}
          />
          <TextInput
            label={MECHANIC_CUSTOM_QUOTE_COPY.qtyPlaceholder}
            value={quantity}
            onChangeText={onChangeQuantity}
            mode="outlined"
            dense
            keyboardType="number-pad"
            style={styles.qty}
            outlineColor={colors.outline}
            activeOutlineColor={colors.primary}
          />
        </View>
      </View>

      {canRemove && (
        <TouchableOpacity style={styles.remove} onPress={onRemove} hitSlop={8}>
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  fields: {
    flex: 1,
    gap: spacing.sm,
  },
  name: {
    backgroundColor: colors.surface,
  },
  numbers: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  price: {
    flex: 2,
    backgroundColor: colors.surface,
  },
  qty: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  remove: {
    paddingTop: spacing.sm,
  },
});
