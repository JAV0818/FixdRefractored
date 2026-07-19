// Loading state for the provider profile edit screen.

import { StyleSheet, View } from "react-native";
import { ActivityIndicator } from "react-native";

import { colors } from "@/theme";

export const ProviderProfileEditLoadingView = () => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color={colors.primary} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
