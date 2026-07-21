// Inspection checklist (mechanic). A curated DVI: each item rated green/yellow/
// red with an optional note, plus overall notes + photos. Loads any saved report
// so it reopens with prior entries; on save, uploads new photos and stamps the
// order's inspectionCompletedAt (which unlocks "Complete job").

import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, HelperText, Text } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";

import { AppButton, AppCard, ImagePickerGrid, KeyboardSafeView, MultilineTextInput } from "@/components";
import { colors, fontSize, fontWeight, spacing } from "@/theme";
import { TAB_BAR_CLEARANCE } from "@/constants/layout";
import { useOrder } from "@/hooks/use-order";
import { useImagePicker } from "@/hooks/use-image-picker";
import type { InspectionItemResult, InspectionRating } from "@/types/inspection.interface";

import {
  INSPECTION_COPY,
  INSPECTION_SECTIONS,
  MAX_INSPECTION_PHOTOS,
} from "../inspection-checklist.constants";
import { InspectionSection, RatingItem } from "../components";
import { useInspection } from "../hooks/use-inspection";
import { useSaveInspection } from "../hooks/use-save-inspection";

type Ratings = Record<string, InspectionItemResult>;

export const InspectionChecklistView = () => {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { data: order, isLoading: orderLoading } = useOrder(orderId);
  const { data: existing, isLoading: inspectionLoading } = useInspection(orderId);
  const saveInspection = useSaveInspection();

  const [ratings, setRatings] = useState<Ratings>({});
  const [summaryNotes, setSummaryNotes] = useState("");
  const [existingPhotoUrls, setExistingPhotoUrls] = useState<string[]>([]);
  const [newPhotoUris, setNewPhotoUris] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Seed the form from the saved report once it loads (only once).
  useEffect(() => {
    if (!hydrated && existing) {
      setRatings(existing.ratings ?? {});
      setSummaryNotes(existing.summaryNotes ?? "");
      setExistingPhotoUrls(existing.photoUrls ?? []);
      setHydrated(true);
    }
  }, [existing, hydrated]);

  const setItem = useCallback((key: string, patch: Partial<InspectionItemResult>) => {
    setRatings((prev) => ({
      ...prev,
      [key]: { rating: prev[key]?.rating ?? null, note: prev[key]?.note ?? "", ...patch },
    }));
  }, []);

  // One stable callback shared by every RatingItem (each passes its own key back),
  // so a keystroke in one item doesn't re-render all the others.
  const handleRating = useCallback(
    (key: string, rating: InspectionRating) => setItem(key, { rating }),
    [setItem],
  );
  const handleNote = useCallback(
    (key: string, note: string) => setItem(key, { note }),
    [setItem],
  );

  const pickFromLibrary = useImagePicker();
  const photos = useMemo(
    () => [...existingPhotoUrls, ...newPhotoUris],
    [existingPhotoUrls, newPhotoUris],
  );
  const addPhotos = useCallback(async () => {
    const picked = await pickFromLibrary(MAX_INSPECTION_PHOTOS - existingPhotoUrls.length - newPhotoUris.length);
    if (picked.length) {
      setNewPhotoUris((prev) =>
        [...prev, ...picked].slice(0, MAX_INSPECTION_PHOTOS - existingPhotoUrls.length),
      );
    }
  }, [pickFromLibrary, existingPhotoUrls.length, newPhotoUris.length]);

  const removePhoto = useCallback((uri: string) => {
    setExistingPhotoUrls((prev) => prev.filter((u) => u !== uri));
    setNewPhotoUris((prev) => prev.filter((u) => u !== uri));
  }, []);

  const hasAnyRating = useMemo(
    () => Object.values(ratings).some((r) => r.rating !== null),
    [ratings],
  );

  const onSave = useCallback(() => {
    if (!orderId) return;
    saveInspection.mutate(
      { orderId, ratings, summaryNotes, existingPhotoUrls, newPhotoUris },
      { onSuccess: () => router.back() },
    );
  }, [orderId, ratings, summaryNotes, existingPhotoUrls, newPhotoUris, saveInspection, router]);

  if (orderLoading || inspectionLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator animating color={colors.primary} />
      </View>
    );
  }
  if (!order) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>{INSPECTION_COPY.notFound}</Text>
      </View>
    );
  }

  return (
    <KeyboardSafeView contentContainerStyle={styles.content}>
      <View>
        <Text style={styles.vehicle}>{order.vehicleInfo}</Text>
        <Text style={styles.hint}>{INSPECTION_COPY.hint}</Text>
      </View>

      {INSPECTION_SECTIONS.map((section, index) => (
        <InspectionSection key={section.key} title={section.title} defaultExpanded={index === 0}>
          {section.items.map((item) => (
            <RatingItem
              key={item.key}
              itemKey={item.key}
              label={item.label}
              rating={ratings[item.key]?.rating ?? null}
              note={ratings[item.key]?.note ?? ""}
              onChangeRating={handleRating}
              onChangeNote={handleNote}
            />
          ))}
        </InspectionSection>
      ))}

      <AppCard>
        <Text style={styles.sectionTitle}>{INSPECTION_COPY.summaryLabel}</Text>
        <MultilineTextInput
          value={summaryNotes}
          onChangeText={setSummaryNotes}
          numberOfLines={4}
          style={styles.summary}
        />
        <Text style={styles.sectionTitle}>{INSPECTION_COPY.photos}</Text>
        <ImagePickerGrid
          uris={photos}
          max={MAX_INSPECTION_PHOTOS}
          onAdd={addPhotos}
          onRemove={removePhoto}
        />
      </AppCard>

      {saveInspection.isError && (
        <HelperText type="error" visible>
          {INSPECTION_COPY.saveError}
        </HelperText>
      )}

      <AppButton
        onPress={onSave}
        loading={saveInspection.isPending}
        disabled={!hasAnyRating || saveInspection.isPending}
      >
        {saveInspection.isPending ? INSPECTION_COPY.saving : INSPECTION_COPY.save}
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
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    padding: spacing.lg,
  },
  muted: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  vehicle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  summary: {
    minHeight: 96,
  },
});
