import { useQuery } from "@tanstack/react-query";

import { cometChatService } from "@/services/comet-chat-service";

import type { CometChatMessage } from "@/services/comet-chat-service";

export const useMessages = (conversationUID: string) => {
  return useQuery<CometChatMessage[], Error>({
    queryKey: ["messages", conversationUID],
    queryFn: () => cometChatService.getMessages(conversationUID),
    enabled: !!conversationUID,
  });
};
