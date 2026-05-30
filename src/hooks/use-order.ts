// useOrder — a single order, streamed live via Firestore onSnapshot so status
// changes (e.g. a mechanic proposing a quote) appear without a manual refresh.
// Returns the same { data, isLoading, isError, refetch } shape the view switches
// expect; `data` is null when the order doesn't exist.

import { useCallback, useEffect, useState } from "react";

import { orderService } from "@/services/order-service";
import type { RepairOrder } from "@/types/order.interface";

export const useOrder = (orderId: string | undefined) => {
  const [data, setData] = useState<RepairOrder | null>();
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  // Re-attach the listener (used by the error view's retry).
  const refetch = useCallback(() => setAttempt((a) => a + 1), []);

  useEffect(() => {
    if (!orderId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setIsError(false);
    const unsubscribe = orderService.subscribeToOrder(
      orderId,
      (order) => {
        setData(order ?? null);
        setIsLoading(false);
        setIsError(false);
      },
      (error) => {
        console.error("[order] subscription failed:", error);
        setIsError(true);
        setIsLoading(false);
      },
    );
    return unsubscribe;
  }, [orderId, attempt]);

  return { data, isLoading, isError, refetch };
};
