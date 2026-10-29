import { useMutation, useQueryClient } from "@tanstack/react-query";

import { paymentService } from "@/services/payment-service";
import type { OrderItem } from "@/types/order.interface";

type AddCustomChargesInput = {
  orderId: string;
  newItems: OrderItem[];
};

export const useAddCustomCharges = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, newItems }: AddCustomChargesInput) =>
      paymentService.addCustomCharges(orderId, newItems),
    onSuccess: (_data, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["provider-orders"] });
    },
  });
};
