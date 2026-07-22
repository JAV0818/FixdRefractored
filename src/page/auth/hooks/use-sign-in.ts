// useSignIn — React Query mutation wrapping authService.signIn.
//
// Views call mutate({ email, password }) and receive { isPending, isError,
// error, mutate, mutateAsync } back from React Query.

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { auth } from "@/services/firebase";
import { authService } from "@/services/auth-service";

import { useCometChatLogin } from "./use-comet-chat-login";

import type { SignInCredentials } from "../interfaces/auth-credentials.interface";

export const useSignIn = () => {
  const queryClient = useQueryClient();
  const cometChatLogin = useCometChatLogin();

  return useMutation({
    mutationFn: (credentials: SignInCredentials) => authService.signIn(credentials),
    onSuccess: () => {
      // The AuthProvider's onAuthStateChanged listener will hydrate the
      // current user automatically. We also invalidate any user-profile
      // queries so they refetch with fresh auth.
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });

      const uid = auth.currentUser?.uid;
      if (uid) {
        cometChatLogin.mutate({ uid });
      }
    },
  });
};
