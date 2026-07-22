// useSignUp — React Query mutation wrapping authService.signUp.

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { auth } from "@/services/firebase";
import { authService } from "@/services/auth-service";

import { useCometChatLogin } from "./use-comet-chat-login";

import type { SignUpCredentials } from "../interfaces/auth-credentials.interface";

export const useSignUp = () => {
  const queryClient = useQueryClient();
  const cometChatLogin = useCometChatLogin();

  return useMutation({
    mutationFn: (credentials: SignUpCredentials) => authService.signUp(credentials),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });

      const uid = auth.currentUser?.uid;
      if (uid) {
        cometChatLogin.mutate({ uid, name: variables.displayName || uid });
      }
    },
  });
};
