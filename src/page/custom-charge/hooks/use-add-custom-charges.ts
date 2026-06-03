import { useMutation, useQueryClient } from "@tanstack/react-query";

import { orderService } from "@/services/order-service";
import type { OrderItem } from "@/types/order.interface";

type AddCustomChargesInput = {
  orderId: string;
  newItems: OrderItem[];
};

export const useAddCustomCharges = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, newItems }: AddCustomChargesInput) =>
      orderService.addCustomCharges(orderId, newItems),
    onSuccess: (_data, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["provider-orders"] });
    },
  });
};
