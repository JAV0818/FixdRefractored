// The switch for the shared order-detail screen. Reads the orderId from the
// route, fetches the order, and delegates to loading / error / success.

import { useLocalSearchParams } from "expo-router";

import { useOrder } from "@/hooks/use-order";

import { ORDER_DETAIL_COPY } from "../order-detail.constants";
import { OrderDetailLoadingView } from "./order-detail-loading.view";
import { OrderDetailErrorView } from "./order-detail-error.view";
import { OrderDetailSuccessView } from "./order-detail-success.view";

export const OrderDetailView = () => {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { data, isLoading, isError, refetch } = useOrder(orderId);

  if (isLoading) return <OrderDetailLoadingView />;
  if (isError) return <OrderDetailErrorView onRetry={refetch} />;
  if (!data) return <OrderDetailErrorView message={ORDER_DETAIL_COPY.notFound} />;
  return <OrderDetailSuccessView order={data} />;
};
