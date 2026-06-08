// CustomerResultCard — one row in the customer search results. Shows name,
// phone, and vehicle count. Dumb: all data comes in as props.

import { memo } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

import { Avatar } from "@/components";
import { colors, fontSize, fontWeight, radii, spacing } from "@/theme";
import type { UserProfile } from "@/types/user.interface";

type CustomerResultCardProps = {
  customer: UserProfile;
  onSelect: (customer: UserProfile) => void;
};

export const CustomerResultCard = memo(function CustomerResultCard({
  customer,
  onSelect,
}: CustomerResultCardProps) {
  const fullName =
    [customer.firstName, customer.lastName].filter(Boolean).join(" ") || customer.email;
  const vehicleCount = customer.vehicles?.length ?? 0;

  return (
    <TouchableOpacity style={styles.card} onPress={() => onSelect(customer)} activeOpacity={0.7}>
      <Avatar
        name={fullName}
        photoUrl={customer.photoUrl}
        size={40}
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {fullName}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {customer.phone ?? customer.email}
          {vehicleCount > 0 ? ` · ${vehicleCount} vehicle${vehicleCount > 1 ? "s" : ""}` : ""}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textDisabled} />
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
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
  meta: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
