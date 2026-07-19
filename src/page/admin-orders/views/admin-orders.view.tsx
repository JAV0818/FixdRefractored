// AdminOrdersView — the switch. Delegates to loading / error / success siblings.

import type { OrderStatus } from "@/types/order.interface";

import { useAllOrders } from "../hooks/use-all-orders";
import { AdminOrdersErrorView } from "./admin-orders-error.view";
import { AdminOrdersLoadingView } from "./admin-orders-loading.view";
import { AdminOrdersSuccessView } from "./admin-orders-success.view";

type AdminOrdersViewProps = {
  filters?: { status?: OrderStatus };
};

export const AdminOrdersView = ({ filters }: AdminOrdersViewProps) => {
  const { data, isLoading, isError, refetch } = useAllOrders(filters);

  if (isLoading) return <AdminOrdersLoadingView />;
  if (isError) return <AdminOrdersErrorView onRetry={refetch} />;
  return <AdminOrdersSuccessView orders={data ?? []} />;
};
