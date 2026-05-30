// useAcceptOrder — mechanic claims a Pending order → Accepted. Provider identity
// is injected from auth + profile, so the caller only passes the order id.

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuthContext } from "@/providers/auth-provider";
import { useUserProfile } from "@/page/auth/hooks/use-user-profile";
import { orderService } from "@/services/order-service";

export const useAcceptOrder = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useAuthContext();
  const { data: profile } = useUserProfile(currentUser?.id);

  return useMutation({
    mutationFn: (orderId: string) => {
      if (!currentUser) throw new Error("Not authenticated");
      const name =
        [profile?.firstName, profile?.lastName].filter(Boolean).join(" ").trim() ||
        currentUser.displayName ||
        currentUser.email ||
        "Mechanic";
      return orderService.acceptOrder(orderId, currentUser.id, name);
    },
    onSuccess: (_data, orderId) => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["available-orders"] });
      queryClient.invalidateQueries({ queryKey: ["provider-orders"] });
    },
  });
};
