// useDeclineQuote — customer rejects the proposed quote → order Cancelled
// (reason: quote_declined). Releases the $20 Stripe hold first, then marks
// the order as cancelled.

import { useMutation } from "@tanstack/react-query";

import { useAuthContext } from "@/providers/auth-provider";
import { orderService } from "@/services/order-service";
import { paymentService } from "@/services/payment-service";

// No cache invalidation: the order detail and customer Requests list are live
// (onSnapshot), so the decline propagates to every listener on its own.
export const useDeclineQuote = () => {
  const { currentUser } = useAuthContext();
  return useMutation({
    mutationFn: async (orderId: string) => {
      if (!currentUser) throw new Error("Not authenticated");
      // Release the Stripe hold first so the customer's card is freed before
      // the order is marked as cancelled. Idempotent — succeeds if no hold.
      await paymentService.releaseDepositHold(orderId);
      await orderService.declineQuote(orderId, currentUser.id);
    },
  });
};
