import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

import { colors, spacing } from "@/theme";

import { PROVIDER_QUEUE_COPY } from "../provider-queue.constants";

export const ProviderQueueLoadingView = () => (
  <View style={styles.container}>
    <ActivityIndicator animating color={colors.primary} />
    <Text variant="bodyMedium" style={styles.label}>
      {PROVIDER_QUEUE_COPY.loading}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md },
  label: { color: colors.textSecondary },
});
