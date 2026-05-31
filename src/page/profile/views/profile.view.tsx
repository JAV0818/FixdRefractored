// Switch for the profile screen. Consumes auth + the signed-in user's profile
// and picks loading / error / success. A null profile (no doc) is treated as an
// error so sign-out stays reachable.

import { useAuthContext } from "@/providers/auth-provider";
import { useUserProfile } from "@/page/auth/hooks/use-user-profile";

import { ProfileLoadingView } from "./profile-loading.view";
import { ProfileErrorView } from "./profile-error.view";
import { ProfileSuccessView } from "./profile-success.view";

export const ProfileView = () => {
  const { currentUser, isHydrated } = useAuthContext();
  const { data, isLoading, isError, refetch } = useUserProfile(currentUser?.id);

  if (!isHydrated || isLoading) return <ProfileLoadingView />;
  if (isError || !data) return <ProfileErrorView onRetry={refetch} />;
  return <ProfileSuccessView profile={data} />;
};
