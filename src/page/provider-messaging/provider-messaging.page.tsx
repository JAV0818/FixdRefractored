// Composition shell for the provider Messages tab.

import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, fontSize, fontWeight, spacing } from "@/theme";

import { PROVIDER_MESSAGING_COPY } from "./provider-messaging.constants";
import { ProviderMessagingView } from "./views/provider-messaging.view";

export default function ProviderMessagingPage() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>{PROVIDER_MESSAGING_COPY.title}</Text>
      </View>
      <ProviderMessagingView />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: fontSize["2.5xl"],
    fontWeight: fontWeight.bold,
  },
});
