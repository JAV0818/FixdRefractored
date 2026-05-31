// MechanicAboutView — the self-contained editable About section. Owns the edit
// state (bio + specialties drafts) and the save mutation, and renders the dumb
// MechanicAboutCard. Specialty options are the canonical service categories plus
// any custom ones the mechanic has added.

import { useCallback, useMemo, useState } from "react";

import { SERVICE_CATEGORY_LABELS } from "@/constants/service-categories";
import type { ProviderDetails } from "@/types/user.interface";

import { MechanicAboutCard } from "../components";
import { useUpdateAbout } from "../hooks/use-update-about";

type MechanicAboutViewProps = {
  provider: ProviderDetails;
};

export const MechanicAboutView = ({ provider }: MechanicAboutViewProps) => {
  const updateAbout = useUpdateAbout();

  const [editing, setEditing] = useState(false);
  const [draftBio, setDraftBio] = useState("");
  const [draftSpecialties, setDraftSpecialties] = useState<string[]>([]);

  // Preset categories first, then any custom specialties, deduped — so a custom
  // value the mechanic added shows as a selected chip alongside the presets.
  const options = useMemo(
    () => Array.from(new Set([...SERVICE_CATEGORY_LABELS, ...draftSpecialties])),
    [draftSpecialties],
  );

  const onEdit = useCallback(() => {
    setDraftBio(provider.bio);
    setDraftSpecialties(provider.specialties);
    setEditing(true);
  }, [provider.bio, provider.specialties]);

  const onCancel = useCallback(() => setEditing(false), []);

  const onChangeBio = useCallback((text: string) => setDraftBio(text), []);

  const onToggleSpecialty = useCallback((value: string) => {
    setDraftSpecialties((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value],
    );
  }, []);

  const onAddSpecialty = useCallback((value: string) => {
    setDraftSpecialties((prev) => (prev.includes(value) ? prev : [...prev, value]));
  }, []);

  const onSave = useCallback(() => {
    updateAbout.mutate(
      { bio: draftBio.trim(), specialties: draftSpecialties },
      { onSuccess: () => setEditing(false) },
    );
  }, [updateAbout, draftBio, draftSpecialties]);

  return (
    <MechanicAboutCard
      editing={editing}
      saving={updateAbout.isPending}
      bio={provider.bio}
      specialties={provider.specialties}
      draftBio={draftBio}
      draftSpecialties={draftSpecialties}
      options={options}
      onEdit={onEdit}
      onCancel={onCancel}
      onSave={onSave}
      onChangeBio={onChangeBio}
      onToggleSpecialty={onToggleSpecialty}
      onAddSpecialty={onAddSpecialty}
    />
  );
};
