// Switch for the provider Messages list: loading / error / success.

import { useConversations } from "../hooks/use-conversations";
import { ProviderMessagingErrorView } from "./provider-messaging-error.view";
import { ProviderMessagingLoadingView } from "./provider-messaging-loading.view";
import { ProviderMessagingSuccessView } from "./provider-messaging-success.view";

export const ProviderMessagingView = () => {
  const { data, isLoading, isError, refetch } = useConversations();

  if (isLoading) return <ProviderMessagingLoadingView />;
  if (isError) return <ProviderMessagingErrorView onRetry={refetch} />;
  return <ProviderMessagingSuccessView conversations={data ?? []} />;
};
