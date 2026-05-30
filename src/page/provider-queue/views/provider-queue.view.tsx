// Switch for the provider Queue: the mechanic's own accepted/active jobs. The
// available-order pool lives in the Marketplace tab, not here.

import { useAuthContext } from "@/providers/auth-provider";

import { useProviderOrders } from "../hooks/use-provider-orders";
import { ProviderQueueLoadingView } from "./provider-queue-loading.view";
import { ProviderQueueErrorView } from "./provider-queue-error.view";
import { ProviderQueueSuccessView } from "./provider-queue-success.view";

export const ProviderQueueView = () => {
  const { currentUser, isHydrated } = useAuthContext();
  const mine = useProviderOrders(currentUser?.id);

  if (!isHydrated || mine.isLoading) return <ProviderQueueLoadingView />;
  if (mine.isError) return <ProviderQueueErrorView onRetry={mine.refetch} />;
  return <ProviderQueueSuccessView mine={mine.data ?? []} />;
};
