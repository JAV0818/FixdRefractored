// useCustomerOrders — the signed-in customer's orders, newest first.

import { useQuery } from "@tanstack/react-query";

import { orderService } from "@/services/order-service";

export const useCustomerOrders = (customerId: string | undefined) =>
  useQuery({
    queryKey: ["customer-orders", customerId],
    queryFn: () => orderService.getOrdersByCustomer(customerId!),
    enabled: !!customerId,
  });
