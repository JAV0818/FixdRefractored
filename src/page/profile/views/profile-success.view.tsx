// Success view for the profile screen. Owns the contact edit state, the profile
// mutations (avatar / contact / availability), and sign-out. Branches on role to
// render the customer or mechanic sections. The page header lives in the page.

import { useCallback, useState } from "react";
import { StyleSheet } from "react-native";

import { AppButton, KeyboardSafeView } from "@/components";
import { spacing } from "@/theme";
import { TAB_BAR_CLEARANCE } from "@/constants/layout";
import { useImagePicker } from "@/hooks/use-image-picker";
import { useSignOut } from "@/page/auth/hooks/use-sign-out";
import type { UserProfile } from "@/types/user.interface";

import { PROFILE_COPY } from "../profile.constants";
import { displayNameOf, profileSubtitle } from "../utils/profile-format";
import {
  CustomerSections,
  MechanicAvailabilityCard,
  MechanicStatsCard,
  ProfileContactCard,
  ProfileHeader,
  type ContactDraft,
} from "../components";
import { MechanicAboutView } from "./mechanic-about.view";
import { useUpdateAvatar } from "../hooks/use-update-avatar";
import { useUpdateContact } from "../hooks/use-update-contact";
import { useToggleAvailability } from "../hooks/use-toggle-availability";

type ProfileSuccessViewProps = {
  profile: UserProfile;
};

const EMPTY_DRAFT: ContactDraft = { firstName: "", lastName: "", phone: "" };

export const ProfileSuccessView = ({ profile }: ProfileSuccessViewProps) => {
  const pickImage = useImagePicker();
  const updateAvatar = useUpdateAvatar();
  const updateContact = useUpdateContact();
  const toggleAvailability = useToggleAvailability();
  const signOut = useSignOut();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ContactDraft>(EMPTY_DRAFT);

  const onChangePhoto = useCallback(async () => {
    const picked = await pickImage(1);
    if (picked.length) updateAvatar.mutate(picked[0]);
  }, [pickImage, updateAvatar]);

  const onEdit = useCallback(() => {
    setDraft({
      firstName: profile.firstName ?? "",
      lastName: profile.lastName ?? "",
      phone: profile.phone ?? "",
    });
    setEditing(true);
  }, [profile.firstName, profile.lastName, profile.phone]);

  const onCancel = useCallback(() => setEditing(false), []);

  const onChangeField = useCallback((field: keyof ContactDraft, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  }, []);

  const onSave = useCallback(() => {
    updateContact.mutate(
      {
        firstName: draft.firstName.trim() || null,
        lastName: draft.lastName.trim() || null,
        phone: draft.phone.trim() || null,
      },
      { onSuccess: () => setEditing(false) },
    );
  }, [draft, updateContact]);

  const onToggleAvailability = useCallback(
    (next: boolean) => toggleAvailability.mutate(next),
    [toggleAvailability],
  );

  const onSignOut = useCallback(() => signOut.mutate(), [signOut]);

  return (
    <KeyboardSafeView contentContainerStyle={styles.content}>
      <ProfileHeader
        name={displayNameOf(profile)}
        subtitle={profileSubtitle(profile)}
        photoUrl={profile.photoUrl}
        isUploading={updateAvatar.isPending}
        onChangePhoto={onChangePhoto}
      />

      <ProfileContactCard
        email={profile.email}
        displayName={displayNameOf(profile)}
        phone={profile.phone}
        editing={editing}
        draft={draft}
        saving={updateContact.isPending}
        onChange={onChangeField}
        onEdit={onEdit}
        onSave={onSave}
        onCancel={onCancel}
      />

      {profile.role === "provider" && profile.providerProfile ? (
        <>
          <MechanicAvailabilityCard
            isAvailable={profile.providerProfile.isAvailable}
            pending={toggleAvailability.isPending}
            onToggle={onToggleAvailability}
          />
          <MechanicAboutView provider={profile.providerProfile} />
          <MechanicStatsCard provider={profile.providerProfile} />
        </>
      ) : null}

      {profile.role === "customer" ? (
        <CustomerSections
          vehicles={profile.vehicles ?? []}
          averageRating={profile.averageRating}
          totalRatingsCount={profile.totalRatingsCount}
          completedOrdersCount={profile.completedOrdersCount}
        />
      ) : null}

      <AppButton
        variant="secondary"
        icon="logout"
        onPress={onSignOut}
        loading={signOut.isPending}
        disabled={signOut.isPending}
        style={styles.signOut}
      >
        {PROFILE_COPY.signOut}
      </AppButton>
    </KeyboardSafeView>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: TAB_BAR_CLEARANCE,
  },
  signOut: {
    marginTop: spacing.sm,
  },
});
