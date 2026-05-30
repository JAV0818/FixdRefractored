// Switch for the customer Requests list. Consumes auth + the customer's orders.

import { useAuthContext } from "@/providers/auth-provider";

import { useCustomerOrders } from "../hooks/use-customer-orders";
import { CustomerRequestsLoadingView } from "./customer-requests-loading.view";
import { CustomerRequestsErrorView } from "./customer-requests-error.view";
import { CustomerRequestsSuccessView } from "./customer-requests-success.view";

export const CustomerRequestsView = () => {
  const { currentUser, isHydrated } = useAuthContext();
  const { data, isLoading, isError, refetch } = useCustomerOrders(currentUser?.id);

  if (!isHydrated || isLoading) return <CustomerRequestsLoadingView />;
  if (isError) return <CustomerRequestsErrorView onRetry={refetch} />;
  return <CustomerRequestsSuccessView orders={data ?? []} />;
};
