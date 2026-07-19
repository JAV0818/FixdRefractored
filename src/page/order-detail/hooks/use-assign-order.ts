// useAssignOrder — owner/admin assigns a mechanic to an order.
// Wraps orderService.assignOrderToProvider and invalidates order queries on success.

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuthContext } from "@/providers/auth-provider";
import { orderService } from "@/services/order-service";

type AssignOrderInput = {
  orderId: string;
  providerId: string;
};

export const useAssignOrder = () => {
  const { currentUser } = useAuthContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, providerId }: AssignOrderInput) => {
      if (!currentUser) throw new Error("Not authenticated");
      return orderService.assignOrderToProvider(orderId, providerId, currentUser.id);
    },
    onSuccess: (_data, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["all-orders"] });
    },
  });
};
