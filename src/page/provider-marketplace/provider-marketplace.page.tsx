// Composition shell for the provider Marketplace tab.

import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { colors, fontSize, fontWeight, radii, shadows, spacing } from "@/theme";

import { PROVIDER_MARKETPLACE_COPY } from "./provider-marketplace.constants";
import { ProviderMarketplaceView } from "./views";

export const ProviderMarketplacePage = () => {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>{PROVIDER_MARKETPLACE_COPY.title}</Text>
        <TouchableOpacity
          style={styles.glassPill}
          activeOpacity={0.7}
          onPress={() => router.push("/(provider-tabs)/queue/custom-quote")}
        >
          <MaterialCommunityIcons name="plus" size={18} color={colors.primary} />
          <Text style={styles.glassPillLabel}>
            {PROVIDER_MARKETPLACE_COPY.customQuote}
          </Text>
        </TouchableOpacity>
      </View>
      <ProviderMarketplaceView />
    </SafeAreaView>
  );
};

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
  glassPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.glassPrimaryTint,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.glass,
  },
  glassPillLabel: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.sm,
  },
});
