// Loading state for the mechanic detail screen.

import { ActivityIndicator, StyleSheet, View } from "react-native";

import { colors } from "@/theme";

export const MechanicDetailLoadingView = () => (
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
