// useAvailableOrders — the marketplace feed: unassigned, still-pending orders a
// mechanic can browse and accept.

import { useQuery } from "@tanstack/react-query";

import { orderService } from "@/services/order-service";

export const useAvailableOrders = () =>
  useQuery({
    queryKey: ["available-orders"],
    queryFn: () => orderService.getAvailableOrders(),
  });
