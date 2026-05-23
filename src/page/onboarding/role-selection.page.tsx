import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "react-native-paper";
import { useState } from "react";

import { colors, spacing, radii } from "@/theme";
import { ROLE_OPTIONS } from "./onboarding.constants";
import type { UserRole } from "@/types/user.interface";

export const RoleSelectionPage = () => {
  const theme = useTheme();
  const router = useRouter();
  const [selected, setSelected] = useState<UserRole | null>(null);

  const onContinue = () => {
    if (!selected) return;
    router.push({ pathname: "/(onboarding)/welcome-slides", params: { role: selected } });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Welcome to Fixd
        </Text>
        <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          How will you be using the app?
        </Text>
      </View>

      <View style={styles.cards}>
        {ROLE_OPTIONS.map((option) => {
          const isSelected = selected === option.role;
          return (
            <TouchableOpacity
              key={option.role}
              style={[
                styles.card,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: isSelected ? colors.primary : colors.outline,
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
              onPress={() => setSelected(option.role)}
              activeOpacity={0.8}
            >
              <Text style={styles.icon}>{option.icon}</Text>
              <Text variant="titleLarge" style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
                {option.title}
              </Text>
              <Text variant="bodyMedium" style={[styles.cardSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                {option.subtitle}
              </Text>
              {isSelected && (
                <View style={[styles.checkBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[
          styles.continueButton,
          { backgroundColor: selected ? colors.primary : colors.outline },
        ]}
        onPress={onContinue}
        disabled={!selected}
        activeOpacity={0.8}
      >
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  header: {
    marginTop: spacing.xxl,
    marginBottom: spacing.xxl,
  },
  title: {
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  subtitle: {
    lineHeight: 22,
  },
  cards: {
    flex: 1,
    gap: spacing.md,
  },
  card: {
    borderRadius: radii.lg,
    padding: spacing.xl,
    position: "relative",
  },
  icon: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    lineHeight: 20,
  },
  checkBadge: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  checkText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  continueButton: {
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignItems: "center",
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  continueText: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
});
