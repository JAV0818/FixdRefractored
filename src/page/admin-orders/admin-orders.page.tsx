// Composition shell for the admin All Orders screen.

import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { FilterChipRow } from "@/components";
import { colors, fontSize, fontWeight, spacing } from "@/theme";
import type { OrderStatus } from "@/types/order.interface";

import { ADMIN_ORDERS_COPY, FILTER_OPTIONS } from "./admin-orders.constants";
import { AdminOrdersView } from "./views";

export const AdminOrdersPage = () => {
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>{ADMIN_ORDERS_COPY.title}</Text>
      </View>
      <FilterChipRow
        options={FILTER_OPTIONS}
        selected={statusFilter}
        onSelect={(value) => setStatusFilter(value as "all" | OrderStatus)}
      />
      <AdminOrdersView
        filters={{ status: statusFilter === "all" ? undefined : statusFilter }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize["2.5xl"],
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
});
