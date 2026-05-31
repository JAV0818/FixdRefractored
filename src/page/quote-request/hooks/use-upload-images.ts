// use-upload-images — mutation that uploads the customer's photos for an
// already-created order, then records the returned download URLs on that order.
// Split from use-create-order because Storage paths are keyed by the order id,
// so the order must exist first. The view calls this after createOrder resolves.

import { useMutation } from "@tanstack/react-query";

import { useAuthContext } from "@/providers/auth-provider";
import { orderService } from "@/services/order-service";
import { storageService } from "@/services/storage-service";

type UploadImagesInput = {
  orderId: string;
  uris: string[];
};

export const useUploadImages = () => {
  const { currentUser } = useAuthContext();

  return useMutation({
    mutationFn: async ({ orderId, uris }: UploadImagesInput): Promise<string[]> => {
      if (!currentUser) throw new Error("Not authenticated");

      const mediaUrls = await storageService.uploadOrderImages(currentUser.id, orderId, uris);

      // The order was just created as Pending; record the photo URLs on it.
      // Re-passing "Pending" is a no-op for status and only patches mediaUrls.
      await orderService.updateOrderStatus(orderId, "Pending", { mediaUrls });

      return mediaUrls;
    },
    // No cache invalidation: the order detail is live (onSnapshot), so the photo
    // URLs appear there on their own.
  });
};
