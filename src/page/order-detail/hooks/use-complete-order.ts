// useCompleteOrder — mechanic finishes a job (InProgress → Completed).

import { useMutation } from "@tanstack/react-query";

import { orderService } from "@/services/order-service";

type CompleteOrderInput = {
  orderId: string;
  providerId: string;
};

// No cache invalidation: the order detail and provider Queue are live
// (onSnapshot), so the completion propagates to every listener on its own.
export const useCompleteOrder = () => {
  return useMutation({
    mutationFn: ({ orderId, providerId }: CompleteOrderInput) =>
      orderService.completeOrder(orderId, providerId),
  });
};
