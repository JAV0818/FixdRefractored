// useApproveQuote — customer approves the proposed quote and books a date.
// The $20 deposit capture happens server-side (payment Cloud Function) once
// wired; this drives the order into Scheduled in the meantime.

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { orderService } from "@/services/order-service";

type ApproveQuoteInput = {
  orderId: string;
  scheduledAt: number;
};

export const useApproveQuote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, scheduledAt }: ApproveQuoteInput) =>
      orderService.approveQuote(orderId, scheduledAt),
    onSuccess: (_data, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["customer-orders"] });
    },
  });
};
