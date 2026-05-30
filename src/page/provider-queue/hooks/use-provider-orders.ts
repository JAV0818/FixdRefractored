// useProviderOrders — orders the signed-in mechanic has accepted/been assigned.

import { useQuery } from "@tanstack/react-query";

import { orderService } from "@/services/order-service";

export const useProviderOrders = (providerId: string | undefined) =>
  useQuery({
    queryKey: ["provider-orders", providerId],
    queryFn: () => orderService.getOrdersByProvider(providerId!),
    enabled: !!providerId,
  });
