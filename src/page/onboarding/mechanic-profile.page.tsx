import { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";

import { KeyboardSafeView } from "@/components";
import { colors, spacing, radii } from "@/theme";
import type { UserRole } from "@/types/user.interface";

const SPECIALTIES = [
  "Oil Change", "Brakes", "Tires", "Engine", "Transmission",
  "Electrical", "AC / Heat", "Suspension", "Exhaust", "Diagnostics",
];

export const MechanicProfilePage = () => {
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role: UserRole }>();

  const [bio, setBio] = useState("");
  const [years, setYears] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSpecialty = (s: string) => {
    setSelected((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const goNext = () => {
    router.push({ pathname: "/(onboarding)/notifications", params: { role } });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardSafeView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.stepLabel}>Step 1 of 2</Text>
          <Text style={styles.title}>Your Profile</Text>
          <Text style={styles.subtitle}>
            Let customers know who you are and what you specialize in.
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Years of Experience"
            value={years}
            onChangeText={setYears}
            mode="outlined"
            style={styles.input}
            outlineColor={colors.outline}
            activeOutlineColor={colors.primary}
            keyboardType="numeric"
            maxLength={2}
          />
          <TextInput
            label="Short Bio (optional)"
            value={bio}
            onChangeText={setBio}
            mode="outlined"
            style={styles.input}
            outlineColor={colors.outline}
            activeOutlineColor={colors.primary}
            multiline
            numberOfLines={3}
            autoCapitalize="sentences"
          />

          <Text style={styles.sectionLabel}>Specialties</Text>
          <View style={styles.chips}>
            {SPECIALTIES.map((s) => {
              const isOn = selected.includes(s);
              return (
                <TouchableOpacity
                  key={s}
                  style={[styles.chip, isOn && styles.chipActive]}
                  onPress={() => toggleSpecialty(s)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, isOn && styles.chipTextActive]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.continueButton} onPress={goNext} activeOpacity={0.8}>
            <Text style={styles.continueText}>Continue</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.skipButton} onPress={goNext}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </KeyboardSafeView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: spacing.lg,
  },
  header: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  stepLabel: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "600",
    marginBottom: spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  form: {
    gap: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: colors.outline,
    backgroundColor: colors.surface,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "18",
  },
  chipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: "600",
  },
  footer: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignItems: "center",
  },
  continueText: {
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
