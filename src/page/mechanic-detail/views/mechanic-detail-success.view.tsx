// Success view for the mechanic detail screen. Displays the mechanic's profile
// information and an isActive toggle for the admin/owner.

import { ScrollView, StyleSheet, View } from "react-native";
import { Switch, Text } from "react-native-paper";

import { AppCard } from "@/components";
import { TAB_BAR_CLEARANCE } from "@/constants/layout";
import { colors, fontSize, fontWeight, lineHeight, radii, spacing } from "@/theme";
import type { MechanicProfile } from "@/types/user.interface";

import { MECHANIC_DETAIL_COPY } from "../mechanic-detail.constants";
import { useToggleMechanicActive } from "../hooks/use-toggle-mechanic-active";

type MechanicDetailSuccessViewProps = {
  mechanic: MechanicProfile;
};

export const MechanicDetailSuccessView = ({ mechanic }: MechanicDetailSuccessViewProps) => {
  const toggleActive = useToggleMechanicActive();

  const onToggleActive = (next: boolean) => {
    toggleActive.mutate({ providerId: mechanic.uid, isActive: next });
  };

  const { providerProfile } = mechanic;
  const ratingDisplay =
    providerProfile.averageRating > 0
      ? providerProfile.averageRating.toFixed(1)
      : MECHANIC_DETAIL_COPY.noRating;

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Name & Email */}
      <AppCard style={styles.section}>
        <Text style={styles.sectionTitle}>{MECHANIC_DETAIL_COPY.contactTitle}</Text>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>{MECHANIC_DETAIL_COPY.name}</Text>
          <Text style={styles.fieldValue}>{mechanic.name}</Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>{MECHANIC_DETAIL_COPY.email}</Text>
          <Text style={styles.fieldValue}>{mechanic.email}</Text>
        </View>
      </AppCard>

      {/* Bio & Specialties */}
      <AppCard style={styles.section}>
        <Text style={styles.sectionTitle}>{MECHANIC_DETAIL_COPY.aboutTitle}</Text>
        <Text style={providerProfile.bio ? styles.bio : styles.muted}>
          {providerProfile.bio || MECHANIC_DETAIL_COPY.noBio}
        </Text>
        <Text style={styles.subLabel}>{MECHANIC_DETAIL_COPY.specialties}</Text>
        {providerProfile.specialties.length === 0 ? (
          <Text style={styles.muted}>{MECHANIC_DETAIL_COPY.noSpecialties}</Text>
        ) : (
          <View style={styles.chips}>
            {providerProfile.specialties.map((s) => (
              <View key={s} style={styles.chip}>
                <Text style={styles.chipText}>{s}</Text>
              </View>
            ))}
          </View>
        )}
      </AppCard>

      {/* Availability */}
      <AppCard style={styles.section}>
        <Text style={styles.sectionTitle}>{MECHANIC_DETAIL_COPY.availabilityTitle}</Text>
        <Text style={styles.fieldValue}>
          {providerProfile.isAvailable
            ? MECHANIC_DETAIL_COPY.availableLabel
            : "Not available"}
        </Text>
      </AppCard>

      {/* Stats */}
      <AppCard style={styles.section}>
        <Text style={styles.sectionTitle}>{MECHANIC_DETAIL_COPY.statsTitle}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statTile}>
            <Text style={styles.statValue}>{ratingDisplay}</Text>
            <Text style={styles.statLabel}>{MECHANIC_DETAIL_COPY.rating}</Text>
          </View>
          <View style={styles.statTile}>
            <Text style={styles.statValue}>{providerProfile.totalJobsCompleted}</Text>
            <Text style={styles.statLabel}>{MECHANIC_DETAIL_COPY.jobsCompleted}</Text>
          </View>
          <View style={styles.statTile}>
            <Text style={styles.statValue}>
              ${Math.round(providerProfile.totalEarnings).toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>{MECHANIC_DETAIL_COPY.earnings}</Text>
          </View>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>{MECHANIC_DETAIL_COPY.experience}</Text>
          <Text style={styles.fieldValue}>
            {MECHANIC_DETAIL_COPY.yearsLabel(providerProfile.yearsExperience)}
          </Text>
        </View>
      </AppCard>

      {/* isActive toggle */}
      <AppCard style={styles.section}>
        <Text style={styles.sectionTitle}>{MECHANIC_DETAIL_COPY.accountTitle}</Text>
        <View style={styles.toggleRow}>
          <View style={styles.toggleText}>
            <Text style={styles.toggleLabel}>{MECHANIC_DETAIL_COPY.activeLabel}</Text>
            <Text style={styles.toggleHint}>{MECHANIC_DETAIL_COPY.activeHint}</Text>
          </View>
          <Switch
            value={mechanic.isActive}
            onValueChange={onToggleActive}
            disabled={toggleActive.isPending}
            color={colors.primary}
          />
        </View>
      </AppCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: TAB_BAR_CLEARANCE,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  fieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  fieldValue: {
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
  bio: {
    fontSize: fontSize.base,
    color: colors.textPrimary,
    lineHeight: fontSize.base * lineHeight.normal,
  },
  muted: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  subLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    marginTop: spacing.xs,
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
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  statTile: {
    flex: 1,
    gap: spacing.xxs,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  toggleText: {
    flex: 1,
    gap: spacing.xxs,
  },
  toggleLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
  toggleHint: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
