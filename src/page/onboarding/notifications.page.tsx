import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";

import { colors, spacing, radii } from "@/theme";
import { useAuthContext } from "@/providers/auth-provider";
import type { UserRole } from "@/types/user.interface";

export const NotificationsPage = () => {
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role: UserRole }>();
  const { completeOnboarding } = useAuthContext();

  const finish = () => {
    completeOnboarding(role as UserRole);
    // Auth gate in _layout.tsx will redirect to the correct tab group
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>🔔</Text>
        </View>

        <Text style={styles.title}>Stay in the Loop</Text>
        <Text style={styles.subtitle}>
          {role === "provider"
            ? "Get notified when new jobs are available near you, when customers accept your quote, and when payments are processed."
            : "Get notified when a mechanic accepts your request, when they're on their way, and when the job is complete."}
        </Text>

        <View style={styles.items}>
          {(role === "provider"
            ? ["New job requests near you", "Quote accepted by customer", "Payment received"]
            : ["Mechanic accepted your request", "Mechanic is on the way", "Job completed"]
          ).map((item) => (
            <View key={item} style={styles.item}>
              <Text style={styles.check}>✓</Text>
              <Text style={styles.itemText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.enableButton}
          onPress={finish}
          activeOpacity={0.8}
        >
          <Text style={styles.enableText}>Enable Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipButton} onPress={finish}>
          <Text style={styles.skipText}>Maybe Later</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: radii.xl,
    backgroundColor: colors.primary + "18",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  icon: {
    fontSize: 44,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  items: {
    alignSelf: "stretch",
    gap: spacing.md,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  check: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "700",
  },
  itemText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "500",
    flex: 1,
  },
  footer: {
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  enableButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignItems: "center",
  },
  enableText: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  skipButton: {
    padding: spacing.md,
    alignItems: "center",
  },
  skipText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
