// useDeclineQuote — customer rejects the proposed quote → order Cancelled
// (reason: quote_declined). Releasing the $20 hold happens server-side.

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuthContext } from "@/providers/auth-provider";
import { orderService } from "@/services/order-service";

export const useDeclineQuote = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useAuthContext();
  return useMutation({
    mutationFn: (orderId: string) => {
      if (!currentUser) throw new Error("Not authenticated");
      return orderService.declineQuote(orderId, currentUser.id);
    },
    onSuccess: (_data, orderId) => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["customer-orders"] });
    },
  });
};
