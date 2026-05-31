// useCompleteOrder — mechanic finishes a job (InProgress → Completed).

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { orderService } from "@/services/order-service";

type CompleteOrderInput = {
  orderId: string;
  providerId: string;
};

export const useCompleteOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, providerId }: CompleteOrderInput) =>
      orderService.completeOrder(orderId, providerId),
    onSuccess: (_data, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["provider-orders"] });
    },
  });
};
