// useCustomerOrders — the signed-in customer's orders, newest first, streamed
// live via Firestore onSnapshot so status changes appear without a refresh.
// Returns the same { data, isLoading, isError, refetch } shape the view expects.

import { useCallback, useEffect, useState } from "react";

import { orderService } from "@/services/order-service";
import type { RepairOrder } from "@/types/order.interface";

export const useCustomerOrders = (customerId: string | undefined) => {
  const [data, setData] = useState<RepairOrder[]>();
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  // Re-attach the listener (used by the error view's retry).
  const refetch = useCallback(() => setAttempt((a) => a + 1), []);

  useEffect(() => {
    if (!customerId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setIsError(false);
    const unsubscribe = orderService.subscribeToCustomerOrders(
      customerId,
      (orders) => {
        setData(orders);
        setIsLoading(false);
        setIsError(false);
      },
      (error) => {
        console.error("[customer-orders] subscription failed:", error);
        setIsError(true);
        setIsLoading(false);
      },
    );
    return unsubscribe;
  }, [customerId, attempt]);

  return { data, isLoading, isError, refetch };
};
