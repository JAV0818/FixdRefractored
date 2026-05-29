// Welcome view — the switch.
//
// Calls hooks, switches on the resulting state, delegates rendering to the
// matching variant. Pattern: <feature>.view.tsx is small and mechanical;
// <feature>-success.view.tsx (and the loading / error siblings) hold the
// actual UI. Empty is handled inside the success view.

import { useAuthContext } from "@/providers";

import { useUserProfile } from "../hooks/use-user-profile";

import { WelcomeErrorView } from "./welcome-error.view";
import { WelcomeLoadingView } from "./welcome-loading.view";
import { WelcomeSuccessView } from "./welcome-success.view";

export const WelcomeView = () => {
  const { currentUser, isHydrated } = useAuthContext();
  const profile = useUserProfile(currentUser?.id);

  // AuthProvider hasn't hydrated yet, or the profile query is pending.
  if (!isHydrated || profile.isLoading) return <WelcomeLoadingView />;

  // Error in the query (or there's no signed-in user — treat that as the
  // same surface; the (tabs) group should never even render in that case
  // once the auth gate is wired up, but be defensive).
  if (profile.isError || !currentUser) {
    return <WelcomeErrorView onRetry={profile.refetch} />;
  }

  // No profile document yet — pass null; the success view handles its own
  // "no data yet" sub-state.
  return <WelcomeSuccessView profile={profile.data ?? null} />;
};
