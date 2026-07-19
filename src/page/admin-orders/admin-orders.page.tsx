// Composition shell for the admin All Orders screen.

import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { FilterChipRow, SignOutButton } from "@/components";
import { colors, fontSize, fontWeight, spacing } from "@/theme";
import { useSignOut } from "@/page/auth/hooks/use-sign-out";
import type { OrderStatus } from "@/types/order.interface";

import { ADMIN_ORDERS_COPY, FILTER_OPTIONS } from "./admin-orders.constants";
import { AdminOrdersView } from "./views";

export const AdminOrdersPage = () => {
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const signOut = useSignOut();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>{ADMIN_ORDERS_COPY.title}</Text>
        <SignOutButton
          onPress={() => signOut.mutate()}
          loading={signOut.isPending}
          disabled={signOut.isPending}
        />
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
