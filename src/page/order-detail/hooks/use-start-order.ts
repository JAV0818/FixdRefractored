// useStartOrder — mechanic starts a Scheduled job, moving it to InProgress.

import { useMutation } from "@tanstack/react-query";

import { orderService } from "@/services/order-service";

// No cache invalidation: the order detail and provider Queue are live
// (onSnapshot), so the status change propagates to every listener on its own.
export const useStartOrder = () => {
  return useMutation({
    mutationFn: (orderId: string) => orderService.startOrder(orderId),
  });
};
