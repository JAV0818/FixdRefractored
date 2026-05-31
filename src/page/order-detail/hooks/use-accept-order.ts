// useAcceptOrder — mechanic claims a Pending order → Accepted. Provider identity
// is injected from auth + profile, so the caller only passes the order id.

import { useMutation } from "@tanstack/react-query";

import { useAuthContext } from "@/providers/auth-provider";
import { useUserProfile } from "@/page/auth/hooks/use-user-profile";
import { orderService } from "@/services/order-service";

// No cache invalidation on success: the order detail, the Marketplace pool, and
// the provider Queue are all live (onSnapshot), so the claim propagates to every
// listener on its own.
export const useAcceptOrder = () => {
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
  });
};
