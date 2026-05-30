// useApproveQuote — customer approves the proposed quote, booking the agreed
// time. The $20 deposit capture happens server-side (payment Cloud Function)
// once wired; this drives the order into Scheduled in the meantime.

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { orderService } from "@/services/order-service";

export const useApproveQuote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => orderService.approveQuote(orderId),
    onSuccess: (_data, orderId) => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["customer-orders"] });
    },
  });
};
