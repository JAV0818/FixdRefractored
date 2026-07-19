// useAllOrders — live stream of every order in the system for the admin/owner
// view, optionally filtered by status. Uses onSnapshot so new orders and status
// changes appear without a manual refresh. Returns { data, isLoading, isError, refetch }.

import { useCallback } from "react";

import {
  useFirestoreSubscription,
  type FirestoreSubscribe,
} from "@/hooks/use-firestore-subscription";
import { orderService } from "@/services/order-service";
import type { OrderStatus, RepairOrder } from "@/types/order.interface";

export const useAllOrders = (filters?: { status?: OrderStatus }) => {
  const subscribe = useCallback<FirestoreSubscribe<RepairOrder[]>>(
    (onData, onError) => orderService.subscribeToAllOrders(onData, onError, filters),
    [filters?.status],
  );

  return useFirestoreSubscription(subscribe, "all-orders");
};
