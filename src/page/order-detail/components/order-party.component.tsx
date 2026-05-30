// OrderParty — the other party on an order (the mechanic shown to the customer,
// the customer shown to the mechanic): avatar + name + tappable phone. Dumb.

import { memo } from "react";
import { Linking, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";

import { Avatar } from "@/components";
import { colors, fontSize, fontWeight, spacing } from "@/theme";

type OrderPartyProps = {
  name: string;
  photoUrl?: string | null;
  phone?: string | null;
};

export const OrderParty = memo(function OrderParty({ name, photoUrl, phone }: OrderPartyProps) {
  return (
    <View style={styles.row}>
      <Avatar name={name} photoUrl={photoUrl} />
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        {phone ? (
          <TouchableOpacity onPress={() => Linking.openURL(`tel:${phone}`)} hitSlop={6}>
            <Text style={styles.phone}>{phone}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  info: {
    flex: 1,
    gap: spacing.xxs,
  },
  name: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  phone: {
    fontSize: fontSize.sm,
    color: colors.primary,
  },
});
