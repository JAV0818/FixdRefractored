// Switch for the customer Messages list. Consumes the shared conversations hook.

import { useConversations } from "../hooks/use-conversations";
import { CustomerMessagingErrorView } from "./customer-messaging-error.view";
import { CustomerMessagingLoadingView } from "./customer-messaging-loading.view";
import { CustomerMessagingSuccessView } from "./customer-messaging-success.view";

export const CustomerMessagingView = () => {
  const { data, isLoading, isError, refetch } = useConversations();

  if (isLoading) return <CustomerMessagingLoadingView />;
  if (isError) return <CustomerMessagingErrorView onRetry={refetch} />;
  return <CustomerMessagingSuccessView conversations={data ?? []} />;
};
