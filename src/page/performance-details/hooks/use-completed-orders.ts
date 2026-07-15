// useCompletedOrders — fetches the mechanic's completed orders for the
// performance-details screen.

import { useQuery } from "@tanstack/react-query";

import { useAuthContext } from "@/providers/auth-provider";
import { orderService } from "@/services/order-service";

export const useCompletedOrders = () => {
  const { currentUser } = useAuthContext();
  return useQuery({
    queryKey: ["completed-orders", currentUser?.id],
    queryFn: async () => {
      const orders = await orderService.getOrdersByProvider(currentUser!.id);
      return orders.filter((o) => o.status === "Completed");
    },
    enabled: !!currentUser,
  });
};
