// useStartOrder — mechanic starts a Scheduled job, moving it to InProgress.

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { orderService } from "@/services/order-service";

export const useStartOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => orderService.startOrder(orderId),
    onSuccess: (_data, orderId) => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["provider-orders"] });
    },
  });
};
