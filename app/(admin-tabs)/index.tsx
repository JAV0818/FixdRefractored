import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/theme";

export default function AdminOrdersScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Text variant="headlineMedium" style={styles.title}>Admin</Text>
        <Text variant="bodyMedium" style={styles.sub}>Coming in M8</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  title: { fontWeight: "700", color: colors.textPrimary },
  sub: { marginTop: 8, color: colors.textSecondary },
});
