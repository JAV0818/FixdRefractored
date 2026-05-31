// useProviderOrders — orders the signed-in mechanic has accepted/been assigned,
// streamed live so new jobs and status changes appear in the Queue without a
// refresh. Returns { data, isLoading, isError, refetch }.

import { useCallback } from "react";

import { orderService } from "@/services/order-service";
import {
  useFirestoreSubscription,
  type FirestoreSubscribe,
} from "@/hooks/use-firestore-subscription";
import type { RepairOrder } from "@/types/order.interface";

export const useProviderOrders = (providerId: string | undefined) => {
  const subscribe = useCallback<FirestoreSubscribe<RepairOrder[]>>(
    (onData, onError) => {
      if (!providerId) return;
      return orderService.subscribeToProviderOrders(providerId, onData, onError);
    },
    [providerId],
  );
  return useFirestoreSubscription(subscribe, "provider-orders");
};
