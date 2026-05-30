// useCancelOrder — cancel an order, recording who cancelled and why.

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { orderService } from "@/services/order-service";
import type { CancellationReason } from "@/types/order.interface";

type CancelOrderInput = {
  orderId: string;
  cancelledBy: string;
  reason: CancellationReason;
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, cancelledBy, reason }: CancelOrderInput) =>
      orderService.cancelOrder(orderId, cancelledBy, reason),
    onSuccess: (_data, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["provider-orders"] });
    },
  });
};
