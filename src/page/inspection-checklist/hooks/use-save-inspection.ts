// useSaveInspection — uploads any new local photos, then saves the report
// (which also stamps the order's inspectionCompletedAt). New photos are merged
// with the ones already saved. `progress` is (done, total) new photos.

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { inspectionService } from "@/services/inspection-service";
import { storageService } from "@/services/storage-service";
import type { InspectionReport } from "@/types/inspection.interface";
import type { Photo } from "@/types/photo.interface";
import { splitPhotos } from "@/utils/photos";

type SaveInspectionInput = {
  orderId: string;
  ratings: InspectionReport["ratings"];
  summaryNotes: string;
  existingPhotos: Photo[]; // already uploaded, keep as-is
  newPhotoUris: string[]; // local URIs to upload now
};

type Progress = { done: number; total: number };

export const useSaveInspection = () => {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<Progress | null>(null);

  const mutation = useMutation({
    mutationFn: async ({
      orderId,
      ratings,
      summaryNotes,
      existingPhotos,
      newPhotoUris,
    }: SaveInspectionInput) => {
      try {
        setProgress(newPhotoUris.length ? { done: 0, total: newPhotoUris.length } : null);
        const uploaded = newPhotoUris.length
          ? await storageService.uploadInspectionImages(orderId, newPhotoUris, (done, total) =>
              setProgress({ done, total }),
            )
          : [];
        const { urls, thumbUrls } = splitPhotos([...existingPhotos, ...uploaded]);
        await inspectionService.saveInspection(orderId, {
          ratings,
          summaryNotes,
          photoUrls: urls,
          photoThumbUrls: thumbUrls,
        });
      } finally {
        setProgress(null);
      }
    },
    onSuccess: (_data, { orderId }) => {
      // Only the inspection report is React Query; the order detail and Queue are
      // live (onSnapshot) and update themselves.
      queryClient.invalidateQueries({ queryKey: ["inspection", orderId] });
    },
  });

  return { ...mutation, progress };
};
