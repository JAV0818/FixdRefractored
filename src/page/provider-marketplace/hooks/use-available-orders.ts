// useAvailableOrders — the marketplace feed: unassigned, still-pending orders a
// mechanic can browse and accept, streamed live so a newly created order appears
// without a reload. Returns { data, isLoading, isError, refetch }.

import { useCallback } from "react";

import { orderService } from "@/services/order-service";
import {
  useFirestoreSubscription,
  type FirestoreSubscribe,
} from "@/hooks/use-firestore-subscription";
import type { RepairOrder } from "@/types/order.interface";

export const useAvailableOrders = () => {
  const subscribe = useCallback<FirestoreSubscribe<RepairOrder[]>>(
    (onData, onError) => orderService.subscribeToAvailableOrders(onData, onError),
    [],
  );
  return useFirestoreSubscription(subscribe, "available-orders");
};
