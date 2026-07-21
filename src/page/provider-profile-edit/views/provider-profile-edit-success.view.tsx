// ProviderProfileEditSuccessView — full-page form for editing the mechanic's
// bio, specialties, years of experience, and avatar. Pre-populates from the
// current profile. On save, navigates back.

import { useCallback, useMemo, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { useRouter } from "expo-router";

import { AppButton, AppCard, AppTextInput, FilterChips, KeyboardSafeView, MultilineTextInput } from "@/components";
import { colors, fontSize, fontWeight, spacing } from "@/theme";
import { SERVICE_CATEGORY_LABELS } from "@/constants/service-categories";
import { useImagePicker } from "@/hooks/use-image-picker";
import { ProfileHeader } from "@/page/profile/components";
import { displayNameOf } from "@/page/profile/utils/profile-format";
import { useUpdateAvatar } from "@/page/profile/hooks/use-update-avatar";
import type { UserProfile } from "@/types/user.interface";

import { PROFILE_EDIT_COPY } from "../provider-profile-edit.constants";
import { useUpdateProviderProfile } from "../hooks/use-update-provider-profile";

type ProviderProfileEditSuccessViewProps = {
  profile: UserProfile;
};

export const ProviderProfileEditSuccessView = ({
  profile,
}: ProviderProfileEditSuccessViewProps) => {
  const router = useRouter();
  const pickImage = useImagePicker();
  const updateAvatar = useUpdateAvatar();
  const updateProfile = useUpdateProviderProfile();

  const provider = profile.providerProfile!;

  const [bio, setBio] = useState(provider.bio);
  const [specialties, setSpecialties] = useState<string[]>(provider.specialties);
  const [yearsExperience, setYearsExperience] = useState(String(provider.yearsExperience));
  const [newSpecialty, setNewSpecialty] = useState("");

  const options = useMemo(
    () => Array.from(new Set([...SERVICE_CATEGORY_LABELS, ...specialties])),
    [specialties],
  );

  const onChangePhoto = useCallback(async () => {
    const picked = await pickImage(1);
    if (picked.length) updateAvatar.mutate(picked[0]);
  }, [pickImage, updateAvatar]);

  const onToggleSpecialty = useCallback((value: string) => {
    setSpecialties((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value],
    );
  }, []);

  const onAddSpecialty = useCallback(() => {
    const value = newSpecialty.trim();
    if (!value) return;
    setSpecialties((prev) => (prev.includes(value) ? prev : [...prev, value]));
    setNewSpecialty("");
  }, [newSpecialty]);

  const onSave = () => {
    const years = parseInt(yearsExperience, 10);
    if (isNaN(years) || years < 0) {
      Alert.alert("Please enter a valid number for years of experience.");
      return;
    }
    updateProfile.mutate(
      { bio: bio.trim(), specialties, yearsExperience: years },
      {
        onSuccess: () => {
          Alert.alert(PROFILE_EDIT_COPY.successMessage, "", [
            { text: "OK", onPress: () => router.back() },
          ]);
        },
        onError: () => Alert.alert(PROFILE_EDIT_COPY.errorGeneric),
      },
    );
  };

  const isBusy = updateProfile.isPending;

  return (
    <KeyboardSafeView contentContainerStyle={styles.content}>
      <ProfileHeader
        name={displayNameOf(profile)}
        subtitle={PROFILE_EDIT_COPY.changePhoto}
        photoUrl={profile.photoUrl}
        isUploading={updateAvatar.isPending}
        onChangePhoto={onChangePhoto}
      />

      <AppCard style={styles.card}>
        <MultilineTextInput
          label={PROFILE_EDIT_COPY.bioLabel}
          value={bio}
          onChangeText={setBio}
          placeholder={PROFILE_EDIT_COPY.bioPlaceholder}
          numberOfLines={4}
          autoCapitalize="sentences"
        />
      </AppCard>

      <AppCard style={styles.card}>
        <Text style={styles.sectionTitle}>{PROFILE_EDIT_COPY.specialties}</Text>
        <FilterChips
          options={options}
          selected={specialties}
          onToggle={onToggleSpecialty}
        />
        <View style={styles.addRow}>
          <AppTextInput
            label={PROFILE_EDIT_COPY.addSpecialtyLabel}
            value={newSpecialty}
            onChangeText={setNewSpecialty}
            onSubmitEditing={onAddSpecialty}
            returnKeyType="done"
            autoCapitalize="words"
            containerStyle={styles.addInput}
          />
          <AppButton
            variant="secondary"
            onPress={onAddSpecialty}
            disabled={!newSpecialty.trim()}
          >
            {PROFILE_EDIT_COPY.add}
          </AppButton>
        </View>
      </AppCard>

      <AppCard style={styles.card}>
        <AppTextInput
          label={PROFILE_EDIT_COPY.yearsExperienceLabel}
          value={yearsExperience}
          onChangeText={setYearsExperience}
          keyboardType="numeric"
          autoCapitalize="none"
        />
      </AppCard>

      <AppButton onPress={onSave} loading={isBusy} disabled={isBusy}>
        {PROFILE_EDIT_COPY.save}
      </AppButton>
    </KeyboardSafeView>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  card: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  addInput: {
    flex: 1,
  },
});
