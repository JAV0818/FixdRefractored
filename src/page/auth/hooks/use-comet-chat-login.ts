// Logs the user into CometChat immediately after Firebase auth succeeds.
// Call this in useSignIn and useSignUp onSuccess callbacks.

import { useMutation } from "@tanstack/react-query";
import { cometChatService } from "@/services/comet-chat-service";

export const useCometChatLogin = () => {
  return useMutation({
    mutationFn: (uid: string) => cometChatService.login(uid),
    onError: (err) => {
      console.warn("[CometChat] Login failed:", err);
      // Non-fatal — app still works without messaging
    },
  });
};
