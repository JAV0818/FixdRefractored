// Logs the user into CometChat immediately after Firebase auth succeeds.
// Call this in useSignIn and useSignUp onSuccess callbacks.

import { useMutation } from "@tanstack/react-query";
import { cometChatService } from "@/services/comet-chat-service";

type CometChatLoginInput = {
  uid: string;
  name?: string;
};

export const useCometChatLogin = () => {
  return useMutation({
    mutationFn: ({ uid, name }: CometChatLoginInput) => cometChatService.login(uid, name),
    onError: (err) => {
      console.warn("[CometChat] Login failed:", err);
      // Non-fatal — app still works without messaging
    },
  });
};
