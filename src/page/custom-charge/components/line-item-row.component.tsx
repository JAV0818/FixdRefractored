// LineItemRow — one editable charge line (name, price, qty) with a remove
// button. Dumb: values are strings (raw input), parsed by the view at submit.

import { memo } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { TextInput } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

import { colors, radii, shadows, spacing } from "@/theme";

import { CUSTOM_CHARGE_COPY } from "../custom-charge.constants";

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
          label={CUSTOM_CHARGE_COPY.itemNamePlaceholder}
          value={name}
          onChangeText={onChangeName}
          mode="outlined"
          dense
          style={styles.name}
          outlineColor={colors.glassBorderStrong}
          activeOutlineColor={colors.primary}
        />
        <View style={styles.numbers}>
          <TextInput
            label={CUSTOM_CHARGE_COPY.pricePlaceholder}
            value={price}
            onChangeText={onChangePrice}
            mode="outlined"
            dense
            keyboardType="decimal-pad"
            style={styles.price}
            outlineColor={colors.glassBorderStrong}
            activeOutlineColor={colors.primary}
          />
          <TextInput
            label={CUSTOM_CHARGE_COPY.qtyPlaceholder}
            value={quantity}
            onChangeText={onChangeQuantity}
            mode="outlined"
            dense
            keyboardType="number-pad"
            style={styles.qty}
            outlineColor={colors.glassBorderStrong}
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
    backgroundColor: colors.glassSurface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadows.glass,
  },
  fields: {
    flex: 1,
    gap: spacing.sm,
  },
  name: {
    backgroundColor: colors.glassSurfaceHighlight,
  },
  numbers: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  price: {
    flex: 2,
    backgroundColor: colors.glassSurfaceHighlight,
  },
  qty: {
    flex: 1,
    backgroundColor: colors.glassSurfaceHighlight,
  },
  remove: {
    paddingTop: spacing.sm,
  },
});
