// useCancelOrder — cancel an order, recording who cancelled and why.
// If a Stripe deposit hold exists, releases it before cancelling.

import { useMutation } from "@tanstack/react-query";

import { orderService } from "@/services/order-service";
import { paymentService } from "@/services/payment-service";
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
    mutationFn: async ({ orderId, cancelledBy, reason }: CancelOrderInput) => {
      // Release the Stripe hold if one exists. The CF is idempotent — returns
      // success when there's nothing to release.
      await paymentService.releaseDepositHold(orderId);
      await orderService.cancelOrder(orderId, cancelledBy, reason);
    },
  });
};
