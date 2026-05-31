// Composition shell for the mechanic's inspection checklist.

import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, fontSize, fontWeight, spacing } from "@/theme";

import { INSPECTION_COPY } from "./inspection-checklist.constants";
import { InspectionChecklistView } from "./views";

export const InspectionChecklistPage = () => (
  <SafeAreaView style={styles.container} edges={["top"]}>
    <View style={styles.header}>
      <Text style={styles.title}>{INSPECTION_COPY.title}</Text>
    </View>
    <InspectionChecklistView />
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
});
