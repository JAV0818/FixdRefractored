// The switch for the customer Services home. Consumes auth + profile and picks
// loading / error / success. The greeting needs the profile, so we guard on it.

import { useAuthContext } from "@/providers/auth-provider";
import { useUserProfile } from "@/page/auth/hooks/use-user-profile";

import { CustomerHomeLoadingView } from "./customer-home-loading.view";
import { CustomerHomeErrorView } from "./customer-home-error.view";
import { CustomerHomeSuccessView } from "./customer-home-success.view";

export const CustomerHomeView = () => {
  const { currentUser, isHydrated } = useAuthContext();
  const profile = useUserProfile(currentUser?.id);

  if (!isHydrated || profile.isLoading) return <CustomerHomeLoadingView />;
  if (profile.isError) return <CustomerHomeErrorView onRetry={profile.refetch} />;

  return <CustomerHomeSuccessView profile={profile.data ?? null} />;
};
