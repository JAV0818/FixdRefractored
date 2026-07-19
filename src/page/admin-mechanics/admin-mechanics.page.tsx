// Composition shell for the admin Mechanics list screen.

import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, fontSize, fontWeight, spacing } from "@/theme";

import { ADMIN_MECHANICS_COPY } from "./admin-mechanics.constants";
import { AdminMechanicsView } from "./views";

export const AdminMechanicsPage = () => (
  <SafeAreaView style={styles.container} edges={["top"]}>
    <View style={styles.header}>
      <Text style={styles.title}>{ADMIN_MECHANICS_COPY.title}</Text>
    </View>
    <AdminMechanicsView />
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize["2.5xl"],
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
});
