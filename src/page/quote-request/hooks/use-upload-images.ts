// use-upload-images — mutation that uploads the customer's photos for an
// already-created order, then records the returned download URLs on that order.
// Split from use-create-order because Storage paths are keyed by the order id,
// so the order must exist first. The view calls this after createOrder resolves.
// `progress` is (done, total) photos, for the submit button label.

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { useAuthContext } from "@/providers/auth-provider";
import { orderService } from "@/services/order-service";
import { storageService } from "@/services/storage-service";
import type { Photo } from "@/types/photo.interface";
import { splitPhotos } from "@/utils/photos";

type UploadImagesInput = {
  orderId: string;
  uris: string[];
};

type Progress = { done: number; total: number };

export const useUploadImages = () => {
  const { currentUser } = useAuthContext();
  const [progress, setProgress] = useState<Progress | null>(null);

  const mutation = useMutation({
    mutationFn: async ({ orderId, uris }: UploadImagesInput): Promise<Photo[]> => {
      if (!currentUser) throw new Error("Not authenticated");

      setProgress({ done: 0, total: uris.length });
      try {
        const photos = await storageService.uploadOrderImages(
          currentUser.id,
          orderId,
          uris,
          (done, total) => setProgress({ done, total }),
        );

        // The order was just created as Pending; record the photo URLs on it.
        // Re-passing "Pending" is a no-op for status and only patches the media.
        const { urls, thumbUrls } = splitPhotos(photos);
        await orderService.updateOrderStatus(orderId, "Pending", {
          mediaUrls: urls,
          mediaThumbUrls: thumbUrls,
        });

        return photos;
      } finally {
        setProgress(null);
      }
    },
    // No cache invalidation: the order detail is live (onSnapshot), so the photo
    // URLs appear there on their own.
  });

  return { ...mutation, progress };
};
