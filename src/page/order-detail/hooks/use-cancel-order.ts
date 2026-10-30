// useCancelOrder — cancel an order, recording who cancelled and why.
// Customer cancellations of Scheduled orders go through the 48-hour policy
// Cloud Function. Mechanic cancellations always release the hold.

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
      if (reason === "customer_cancelled") {
        // Server-side 48h policy: releases hold if >= 48h out, captures if < 48h.
        const { charged } = await paymentService.cancelOrderWithPolicy(orderId);
        return { charged };
      }

      // Mechanic or admin cancellation: always release the hold, then cancel.
      await paymentService.releaseDepositHold(orderId);
      await orderService.cancelOrder(orderId, cancelledBy, reason);
      return { charged: false };
    },
  });
};
