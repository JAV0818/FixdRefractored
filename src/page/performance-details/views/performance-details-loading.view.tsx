import { StyleSheet, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";

import { colors } from "@/theme";

export const PerformanceDetailsLoadingView = () => (
  <View style={styles.container}>
    <ActivityIndicator color={colors.primary} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
