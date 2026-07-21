import type { CometChatMessage } from "@/services/comet-chat-service";

export type MessageBubbleProps = {
  isOwnMessage: boolean;
  message: CometChatMessage;
};
