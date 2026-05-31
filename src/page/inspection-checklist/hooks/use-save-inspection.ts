// useSaveInspection — uploads any new local photos, then saves the report
// (which also stamps the order's inspectionCompletedAt). New photo URLs are
// merged with the ones already saved.

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { inspectionService } from "@/services/inspection-service";
import { storageService } from "@/services/storage-service";
import type { InspectionReport } from "@/types/inspection.interface";

type SaveInspectionInput = {
  orderId: string;
  ratings: InspectionReport["ratings"];
  summaryNotes: string;
  existingPhotoUrls: string[]; // already uploaded, keep as-is
  newPhotoUris: string[]; // local URIs to upload now
};

export const useSaveInspection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      ratings,
      summaryNotes,
      existingPhotoUrls,
      newPhotoUris,
    }: SaveInspectionInput) => {
      const uploaded = newPhotoUris.length
        ? await storageService.uploadInspectionImages(orderId, newPhotoUris)
        : [];
      await inspectionService.saveInspection(orderId, {
        ratings,
        summaryNotes,
        photoUrls: [...existingPhotoUrls, ...uploaded],
      });
    },
    onSuccess: (_data, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ["inspection", orderId] });
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["provider-orders"] });
    },
  });
};
