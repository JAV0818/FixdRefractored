// useCancelOrder — cancel an order, recording who cancelled and why.

import { useMutation } from "@tanstack/react-query";

import { orderService } from "@/services/order-service";
import type { CancellationReason } from "@/types/order.interface";

type CancelOrderInput = {
  orderId: string;
  cancelledBy: string;
  reason: CancellationReason;
};

// No cache invalidation: the order detail and provider Queue are live
// (onSnapshot), so the cancellation propagates to every listener on its own.
export const useCancelOrder = () => {
  return useMutation({
    mutationFn: ({ orderId, cancelledBy, reason }: CancelOrderInput) =>
      orderService.cancelOrder(orderId, cancelledBy, reason),
  });
};
