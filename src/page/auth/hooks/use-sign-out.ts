// useSignOut — React Query mutation wrapping authService.signOut.
//
// Views call mutate() to sign out. The AuthProvider's onAuthStateChanged
// listener clears currentUser, which makes the root auth gate redirect to
// /(auth)/sign-in automatically. We clear the query cache so no signed-in
// user's data lingers for the next account.

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authService } from "@/services/auth-service";
import { cometChatService } from "@/services/comet-chat-service";

export const useSignOut = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authService.signOut(),
    onSuccess: async () => {
      try {
        await cometChatService.logout();
      } catch (err) {
        console.warn("[CometChat] Logout failed:", err);
      }

      queryClient.clear();
    },
  });
};
