// MechanicAboutCard — the mechanic's bio + specialties, with an inline edit mode
// (bio input, selectable FilterChips, and an "add a custom specialty" field).
// Controlled: the parent view owns the edit flag, drafts, and mutation. The only
// local state is the in-progress custom-specialty text.

import { memo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { AppButton, AppCard, AppTextInput, FilterChips } from "@/components";
import { colors, fontSize, fontWeight, radii, spacing } from "@/theme";

import { PROFILE_COPY } from "../profile.constants";

type MechanicAboutCardProps = {
  editing: boolean;
  saving: boolean;
  bio: string;
  specialties: string[];
  draftBio: string;
  draftSpecialties: string[];
  options: string[];
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onChangeBio: (text: string) => void;
  onToggleSpecialty: (value: string) => void;
  onAddSpecialty: (value: string) => void;
};

export const MechanicAboutCard = memo(function MechanicAboutCard({
  editing,
  saving,
  bio,
  specialties,
  draftBio,
  draftSpecialties,
  options,
  onEdit,
  onCancel,
  onSave,
  onChangeBio,
  onToggleSpecialty,
  onAddSpecialty,
}: MechanicAboutCardProps) {
  const [newSpecialty, setNewSpecialty] = useState("");

  const addCustom = () => {
    const value = newSpecialty.trim();
    if (!value) return;
    onAddSpecialty(value);
    setNewSpecialty("");
  };

  return (
    <AppCard style={styles.card}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{PROFILE_COPY.aboutTitle}</Text>
        {!editing && (
          <AppButton variant="tertiary" compact onPress={onEdit}>
            {PROFILE_COPY.edit}
          </AppButton>
        )}
      </View>

      {editing ? (
        <View style={styles.form}>
          <AppTextInput
            label={PROFILE_COPY.bioLabel}
            value={draftBio}
            onChangeText={onChangeBio}
            multiline
            numberOfLines={4}
            autoCapitalize="sentences"
          />

          <Text style={styles.subLabel}>{PROFILE_COPY.specialties}</Text>
          <FilterChips
            options={options}
            selected={draftSpecialties}
            onToggle={onToggleSpecialty}
          />

          <View style={styles.addRow}>
            <AppTextInput
              label={PROFILE_COPY.addSpecialtyLabel}
              value={newSpecialty}
              onChangeText={setNewSpecialty}
              onSubmitEditing={addCustom}
              returnKeyType="done"
              autoCapitalize="words"
              containerStyle={styles.addInput}
            />
            <AppButton
              variant="secondary"
              onPress={addCustom}
              disabled={!newSpecialty.trim()}
            >
              {PROFILE_COPY.add}
            </AppButton>
          </View>

          <View style={styles.actions}>
            <AppButton onPress={onSave} loading={saving} disabled={saving}>
              {PROFILE_COPY.save}
            </AppButton>
            <AppButton variant="secondary" onPress={onCancel} disabled={saving}>
              {PROFILE_COPY.cancel}
            </AppButton>
          </View>
        </View>
      ) : (
        <>
          <Text style={bio ? styles.bio : styles.muted}>{bio || PROFILE_COPY.noBio}</Text>
          <Text style={styles.subLabel}>{PROFILE_COPY.specialties}</Text>
          {specialties.length === 0 ? (
            <Text style={styles.muted}>{PROFILE_COPY.noSpecialties}</Text>
          ) : (
            <View style={styles.chips}>
              {specialties.map((s) => (
                <View key={s} style={styles.chip}>
                  <Text style={styles.chipText}>{s}</Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </AppCard>
  );
});

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  form: {
    gap: spacing.sm,
  },
  subLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  addInput: {
    flex: 1,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  bio: {
    fontSize: fontSize.base,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  muted: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    backgroundColor: colors.primary + "18",
  },
  chipText: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
});
