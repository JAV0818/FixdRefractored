import type { CometChatConversation } from "@/services/comet-chat-service";

export type ConversationListItemProps = {
  conversation: CometChatConversation;
  onPress: () => void;
};
