// useOrder — React Query read of a single order by id. Shared by the
// customer + provider order-detail screen (cross-feature → lives in src/hooks).

import { useQuery } from "@tanstack/react-query";

import { orderService } from "@/services/order-service";
import type { RepairOrder } from "@/types/order.interface";

export const useOrder = (orderId: string | undefined) =>
  useQuery({
    queryKey: ["order", orderId],
    queryFn: async (): Promise<RepairOrder | null> => {
      const order = await orderService.getOrderById(orderId!);
      return order ?? null;
    },
    enabled: !!orderId,
  });
