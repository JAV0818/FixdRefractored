// Loading state for the profile screen.

import { ActivityIndicator, StyleSheet, View } from "react-native";

import { colors } from "@/theme";

export const ProfileLoadingView = () => (
  <View style={styles.center}>
    <ActivityIndicator animating color={colors.primary} />
  </View>
);

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
