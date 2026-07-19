// Switch view — loading / error / success based on profile query state.

import { useAuthContext } from "@/providers/auth-provider";
import { useUserProfile } from "@/page/auth/hooks/use-user-profile";

import { ProviderProfileEditErrorView } from "./provider-profile-edit-error.view";
import { ProviderProfileEditLoadingView } from "./provider-profile-edit-loading.view";
import { ProviderProfileEditSuccessView } from "./provider-profile-edit-success.view";

export const ProviderProfileEditView = () => {
  const { currentUser } = useAuthContext();
  const { data: profile, isLoading, isError, refetch } = useUserProfile(currentUser?.id);

  if (isLoading) return <ProviderProfileEditLoadingView />;
  if (isError || !profile?.providerProfile) return <ProviderProfileEditErrorView onRetry={refetch} />;
  return <ProviderProfileEditSuccessView profile={profile} />;
};
