import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

import { colors, spacing } from "@/theme";

import { CUSTOMER_HOME_COPY } from "../customer-home.constants";

export const CustomerHomeLoadingView = () => (
  <View style={styles.container}>
    <ActivityIndicator animating color={colors.primary} />
    <Text variant="bodyMedium" style={styles.label}>
      {CUSTOMER_HOME_COPY.loading}
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
  label: {
    color: colors.textSecondary,
  },
});
