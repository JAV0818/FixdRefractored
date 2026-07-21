import { useMutation } from "@tanstack/react-query";

import { cometChatService } from "@/services/comet-chat-service";

import type { CometChatMessage } from "@/services/comet-chat-service";

type SendMessageInput = {
  receiverUID: string;
  text: string;
  receiverType?: "user" | "group";
};

export const useSendMessage = () => {
  return useMutation<CometChatMessage | undefined, Error, SendMessageInput>({
    mutationFn: ({ receiverUID, text, receiverType = "user" }) =>
      cometChatService.sendTextMessage(receiverUID, text, receiverType),
  });
};
