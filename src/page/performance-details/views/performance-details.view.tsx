// PerformanceDetailsView — switches on profile + orders loading state.

import { useAuthContext } from "@/providers/auth-provider";
import { useUserProfile } from "@/page/auth/hooks/use-user-profile";

import { useCompletedOrders } from "../hooks/use-completed-orders";
import { PerformanceDetailsLoadingView } from "./performance-details-loading.view";
import { PerformanceDetailsErrorView } from "./performance-details-error.view";
import { PerformanceDetailsSuccessView } from "./performance-details-success.view";

export const PerformanceDetailsView = () => {
  const { currentUser } = useAuthContext();
  const profile = useUserProfile(currentUser?.id);
  const orders = useCompletedOrders();

  const isLoading = profile.isLoading || orders.isLoading;
  const isError = profile.isError || orders.isError;

  if (isLoading) return <PerformanceDetailsLoadingView />;
  if (isError || !profile.data?.providerProfile) {
    return (
      <PerformanceDetailsErrorView
        onRetry={() => {
          profile.refetch();
          orders.refetch();
        }}
      />
    );
  }

  return (
    <PerformanceDetailsSuccessView
      provider={profile.data.providerProfile}
      completedOrders={orders.data ?? []}
    />
  );
};
