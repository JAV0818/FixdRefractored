// useCustomerOrders — the signed-in customer's orders, newest first, streamed
// live so status changes appear without a refresh. Returns
// { data, isLoading, isError, refetch }.

import { useCallback } from "react";

import { orderService } from "@/services/order-service";
import {
  useFirestoreSubscription,
  type FirestoreSubscribe,
} from "@/hooks/use-firestore-subscription";
import type { RepairOrder } from "@/types/order.interface";

export const useCustomerOrders = (customerId: string | undefined) => {
  const subscribe = useCallback<FirestoreSubscribe<RepairOrder[]>>(
    (onData, onError) => {
      if (!customerId) return;
      return orderService.subscribeToCustomerOrders(customerId, onData, onError);
    },
    [customerId],
  );
  return useFirestoreSubscription(subscribe, "customer-orders");
};
