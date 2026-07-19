import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

import { colors, spacing } from "@/theme";

import { ADMIN_ORDERS_COPY } from "../admin-orders.constants";

export const AdminOrdersLoadingView = () => (
  <View style={styles.container}>
    <ActivityIndicator animating color={colors.primary} />
    <Text variant="bodyMedium" style={styles.label}>
      {ADMIN_ORDERS_COPY.loading}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  label: { color: colors.textSecondary },
});
