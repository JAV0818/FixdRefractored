// Switch for the provider Marketplace. Consumes the available-orders pool and
// picks loading / error / success. The pool is global (not user-scoped), so no
// auth gating is needed here.

import { useAvailableOrders } from "../hooks/use-available-orders";
import { ProviderMarketplaceLoadingView } from "./provider-marketplace-loading.view";
import { ProviderMarketplaceErrorView } from "./provider-marketplace-error.view";
import { ProviderMarketplaceSuccessView } from "./provider-marketplace-success.view";

export const ProviderMarketplaceView = () => {
  const { data, isLoading, isError, refetch } = useAvailableOrders();

  if (isLoading) return <ProviderMarketplaceLoadingView />;
  if (isError) return <ProviderMarketplaceErrorView onRetry={refetch} />;
  return <ProviderMarketplaceSuccessView orders={data ?? []} />;
};
