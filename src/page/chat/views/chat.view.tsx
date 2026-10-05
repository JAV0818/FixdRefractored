// The switch for the shared chat screen. Fetches messages, wires the send
// mutation, and merges real-time listener messages into local state.

import { useCallback, useEffect, useState } from "react";

import { useAuthContext } from "@/providers/auth-provider";
import { useMessageListener } from "@/page/chat/hooks/use-message-listener";
import { useMessages } from "@/page/chat/hooks/use-messages";
import { useSendMessage } from "@/page/chat/hooks/use-send-message";
import type { CometChatMessage } from "@/services/comet-chat-service";

import { CHAT_COPY } from "../chat.constants";
import { ChatErrorView } from "./chat-error.view";
import { ChatLoadingView } from "./chat-loading.view";
import { ChatSuccessView } from "./chat-success.view";

type ChatViewProps = {
  conversationId: string;
  orderId?: string;
};

// Keep at most this many messages in state to avoid unbounded memory growth
// in long-running conversations. The FlatList is inverted (newest first), so
// we keep the most recent messages and drop the oldest.
const MAX_LOCAL_MESSAGES = 100;

const mergeMessages = (
  existing: CometChatMessage[],
  incoming: CometChatMessage[],
): CometChatMessage[] => {
  const byId = new Map<string, CometChatMessage>();

  for (const message of existing) {
    byId.set(message.id, message);
  }

  for (const message of incoming) {
    byId.set(message.id, message);
  }

  const sorted = Array.from(byId.values()).sort((a, b) => b.sentAt - a.sentAt);
  return sorted.length > MAX_LOCAL_MESSAGES
    ? sorted.slice(0, MAX_LOCAL_MESSAGES)
    : sorted;
};

export const ChatView = ({ conversationId, orderId }: ChatViewProps) => {
  const { currentUser } = useAuthContext();
  const { data, isLoading, isError, refetch } = useMessages(conversationId);
  const sendMessage = useSendMessage();
  const [localMessages, setLocalMessages] = useState<CometChatMessage[]>([]);

  useEffect(() => {
    if (data) {
      setLocalMessages((prev) => mergeMessages(prev, data));
    }
  }, [data]);

  const handleIncomingMessage = useCallback((message: CometChatMessage) => {
    setLocalMessages((prev) => mergeMessages(prev, [message]));
  }, []);

  useMessageListener(conversationId, handleIncomingMessage);

  const handleSend = useCallback(
    (text: string) => {
      sendMessage.mutate(
        { receiverUID: conversationId, text },
        {
          onSuccess: (message) => {
            if (message) {
              setLocalMessages((prev) => mergeMessages(prev, [message]));
            }
          },
        },
      );
    },
    [conversationId, sendMessage],
  );

  if (isLoading) return <ChatLoadingView />;
  if (isError) return <ChatErrorView onRetry={refetch} />;

  return (
    <ChatSuccessView
      conversationId={conversationId}
      currentUserId={currentUser?.id}
      isSending={sendMessage.isPending}
      messages={localMessages}
      onSend={handleSend}
      orderId={orderId}
    />
  );
};
