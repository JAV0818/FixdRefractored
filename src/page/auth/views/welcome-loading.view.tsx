import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

import { AUTH_COPY } from "../auth.constants";
import { spacing } from "@/theme";

export const WelcomeLoadingView = () => (
  <View style={styles.container}>
    <ActivityIndicator animating />
    <Text variant="bodyMedium" style={styles.label}>
      {AUTH_COPY.welcome.bodyLoading}
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
    opacity: 0.7,
  },
});
