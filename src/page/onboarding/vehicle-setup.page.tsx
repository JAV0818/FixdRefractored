import { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";

import { KeyboardSafeView } from "@/components";
import { colors, fontSize, fontWeight, spacing, radii } from "@/theme";
import type { UserRole } from "@/types/user.interface";

export const VehicleSetupPage = () => {
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role: UserRole }>();

  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [color, setColor] = useState("");
  const [plate, setPlate] = useState("");

  const goNext = () => {
    router.push({ pathname: "/(onboarding)/notifications", params: { role } });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardSafeView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.stepLabel}>Step 1 of 2</Text>
          <Text style={styles.title}>Your Vehicle</Text>
          <Text style={styles.subtitle}>
            Help mechanics know what they're working with. You can add more vehicles later.
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Make (e.g. Toyota)"
            value={make}
            onChangeText={setMake}
            mode="outlined"
            style={styles.input}
            outlineColor={colors.outline}
            activeOutlineColor={colors.primary}
            autoCapitalize="words"
          />
          <TextInput
            label="Model (e.g. Camry)"
            value={model}
            onChangeText={setModel}
            mode="outlined"
            style={styles.input}
            outlineColor={colors.outline}
            activeOutlineColor={colors.primary}
            autoCapitalize="words"
          />
          <TextInput
            label="Year (e.g. 2019)"
            value={year}
            onChangeText={setYear}
            mode="outlined"
            style={styles.input}
            outlineColor={colors.outline}
            activeOutlineColor={colors.primary}
            keyboardType="numeric"
            maxLength={4}
          />
          <TextInput
            label="Color (optional)"
            value={color}
            onChangeText={setColor}
            mode="outlined"
            style={styles.input}
            outlineColor={colors.outline}
            activeOutlineColor={colors.primary}
            autoCapitalize="words"
          />
          <TextInput
            label="License Plate (optional)"
            value={plate}
            onChangeText={setPlate}
            mode="outlined"
            style={styles.input}
            outlineColor={colors.outline}
            activeOutlineColor={colors.primary}
            autoCapitalize="characters"
          />
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
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  title: {
    fontSize: fontSize["2.5xl"],
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  form: {
    gap: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
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
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  skipButton: {
    padding: spacing.md,
    alignItems: "center",
  },
  skipText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
