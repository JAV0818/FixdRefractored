import { useQuery } from "@tanstack/react-query";

import { cometChatService } from "@/services/comet-chat-service";

import type { CometChatConversation } from "@/services/comet-chat-service";

export const useConversations = () => {
  return useQuery<CometChatConversation[], Error>({
    queryKey: ["conversations"],
    queryFn: () => cometChatService.getConversations(),
  });
};
