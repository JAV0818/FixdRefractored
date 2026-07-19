import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

import { colors, spacing } from "@/theme";

import { ADMIN_MECHANICS_COPY } from "../admin-mechanics.constants";

export const AdminMechanicsLoadingView = () => (
  <View style={styles.container}>
    <ActivityIndicator animating color={colors.primary} />
    <Text variant="bodyMedium" style={styles.label}>
      {ADMIN_MECHANICS_COPY.loading}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md },
  label: { color: colors.textSecondary },
});
