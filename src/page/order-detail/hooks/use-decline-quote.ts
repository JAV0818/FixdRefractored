// useDeclineQuote — customer rejects the proposed quote → order Cancelled
// (reason: quote_declined). Releasing the $20 hold happens server-side.

import { useMutation } from "@tanstack/react-query";

import { useAuthContext } from "@/providers/auth-provider";
import { orderService } from "@/services/order-service";

// No cache invalidation: the order detail and customer Requests list are live
// (onSnapshot), so the decline propagates to every listener on its own.
export const useDeclineQuote = () => {
  const { currentUser } = useAuthContext();
  return useMutation({
    mutationFn: (orderId: string) => {
      if (!currentUser) throw new Error("Not authenticated");
      return orderService.declineQuote(orderId, currentUser.id);
    },
  });
};
