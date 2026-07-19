// ProfileContactCard — shows email (read-only) plus name and phone, with an
// inline edit mode (text inputs + Save/Cancel). Controlled: the parent owns the
// edit flag and draft values. Dumb otherwise.

import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { AppButton, AppTextInput, GlassCard } from "@/components";
import { colors, fontSize, fontWeight, spacing } from "@/theme";

import { PROFILE_COPY } from "../profile.constants";
import { InfoRow } from "./info-row.component";

export type ContactDraft = {
  firstName: string;
  lastName: string;
  phone: string;
};

type ProfileContactCardProps = {
  email: string;
  displayName: string;
  phone: string | null;
  editing: boolean;
  draft: ContactDraft;
  saving: boolean;
  onChange: (field: keyof ContactDraft, value: string) => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
};

export const ProfileContactCard = memo(function ProfileContactCard({
  email,
  displayName,
  phone,
  editing,
  draft,
  saving,
  onChange,
  onEdit,
  onSave,
  onCancel,
}: ProfileContactCardProps) {
  return (
    <GlassCard style={styles.card}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{PROFILE_COPY.contactTitle}</Text>
        {!editing && (
          <AppButton variant="tertiary" compact onPress={onEdit}>
            {PROFILE_COPY.edit}
          </AppButton>
        )}
      </View>

      <InfoRow label={PROFILE_COPY.email} value={email} />

      {editing ? (
        <View style={styles.form}>
          <AppTextInput
            label={PROFILE_COPY.firstNameLabel}
            value={draft.firstName}
            onChangeText={(text) => onChange("firstName", text)}
            autoCapitalize="words"
          />
          <AppTextInput
            label={PROFILE_COPY.lastNameLabel}
            value={draft.lastName}
            onChangeText={(text) => onChange("lastName", text)}
            autoCapitalize="words"
          />
          <AppTextInput
            label={PROFILE_COPY.phoneLabel}
            value={draft.phone}
            onChangeText={(text) => onChange("phone", text)}
            keyboardType="phone-pad"
          />
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
          <InfoRow label={PROFILE_COPY.name} value={displayName} />
          <InfoRow label={PROFILE_COPY.phone} value={phone || PROFILE_COPY.notSet} />
        </>
      )}
    </GlassCard>
  );
});

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
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
  actions: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
});
