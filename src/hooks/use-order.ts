// useOrder — a single order, streamed live so status changes (e.g. a mechanic
// proposing a quote) appear without a manual refresh. Returns
// { data, isLoading, isError, refetch }; `data` is null when the order doesn't
// exist (and undefined until the first snapshot arrives).

import { useCallback } from "react";

import { orderService } from "@/services/order-service";
import {
  useFirestoreSubscription,
  type FirestoreSubscribe,
} from "@/hooks/use-firestore-subscription";
import type { RepairOrder } from "@/types/order.interface";

export const useOrder = (orderId: string | undefined) => {
  const subscribe = useCallback<FirestoreSubscribe<RepairOrder | null>>(
    (onData, onError) => {
      if (!orderId) return;
      return orderService.subscribeToOrder(orderId, (order) => onData(order ?? null), onError);
    },
    [orderId],
  );
  return useFirestoreSubscription(subscribe, "order");
};
