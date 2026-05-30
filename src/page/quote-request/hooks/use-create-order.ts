// use-create-order — mutation that creates a `repair-orders` document from the
// quote-request form. Identity fields (customerId/name/phone) are injected from
// the signed-in user's auth + profile, so the view only supplies the form data.
// Photos are attached separately by use-upload-images after this resolves
// (Storage paths are keyed by the order id, which doesn't exist until now).

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuthContext } from "@/providers/auth-provider";
import { useUserProfile } from "@/page/auth/hooks/use-user-profile";
import { orderService } from "@/services/order-service";

import type { QuoteRequestForm } from "../interfaces/quote-request.interface";

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useAuthContext();
  const { data: profile } = useUserProfile(currentUser?.id);

  return useMutation({
    // Returns the new order id so the caller can attach photos to it.
    mutationFn: (form: QuoteRequestForm): Promise<string> => {
      if (!currentUser) throw new Error("Not authenticated");

      const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ").trim();

      return orderService.createOrder({
        customerId: currentUser.id,
        customerName: fullName || currentUser.email || "Customer",
        customerPhone: profile?.phone ?? null,
        description: form.description,
        categories: form.categories,
        vehicleInfo: form.vehicleInfo,
        scheduledAt: form.scheduledAt,
        locationDetails: {
          address: form.address,
          city: form.city || null,
          state: form.state || null,
          zip: form.zip || null,
        },
        mediaUrls: [],
      });
    },
    onSuccess: () => {
      // Refresh the customer's order list (Requests tab, M4).
      queryClient.invalidateQueries({ queryKey: ["customer-orders"] });
    },
  });
};
