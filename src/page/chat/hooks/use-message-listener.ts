import { useEffect } from "react";

import { cometChatService } from "@/services/comet-chat-service";

import type { CometChatMessage } from "@/services/comet-chat-service";

export const useMessageListener = (
  conversationUID: string,
  onMessage: (message: CometChatMessage) => void,
) => {
  useEffect(() => {
    const listenerId = `chat-${conversationUID}`;
    cometChatService.addMessageListener(listenerId, {
      onTextMessageReceived: (message) => {
        if (message.senderUid === conversationUID) {
          onMessage(message);
        }
      },
    });
    return () => cometChatService.removeMessageListener(listenerId);
  }, [conversationUID, onMessage]);
};
