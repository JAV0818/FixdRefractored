// CometChat service — the ONLY file in the codebase that imports the CometChat SDK.
// All other files go through this service; never import @cometchat directly elsewhere.
//
// Credentials go in .env:
//   EXPO_PUBLIC_COMET_CHAT_APP_ID=
//   EXPO_PUBLIC_COMET_CHAT_AUTH_KEY=
//   EXPO_PUBLIC_COMET_CHAT_REGION=
//
// NOTE: CometChat requires native modules. This app must be run with a
// dev client build (eas build --profile development), NOT Expo Go.

import { CometChat } from "@cometchat/chat-sdk-react-native";

const APP_ID = process.env.EXPO_PUBLIC_COMET_CHAT_APP_ID ?? "";
const AUTH_KEY = process.env.EXPO_PUBLIC_COMET_CHAT_AUTH_KEY ?? "";
const REGION = process.env.EXPO_PUBLIC_COMET_CHAT_REGION ?? "us";

export type CometChatMessage = {
  id: string;
  text: string;
  senderUid: string;
  senderName: string;
  sentAt: number;
};

export type CometChatConversation = {
  conversationId: string;
  conversationWith: {
    uid: string;
    name: string;
  };
  lastMessage?: CometChatMessage;
  unreadMessageCount: number;
};

export type MessageListenerCallbacks = {
  onTextMessageReceived: (message: CometChatMessage) => void;
};

const isTextMessage = (message: CometChat.BaseMessage): message is CometChat.TextMessage => {
  return message.getType() === "text";
};

const mapMessage = (message: CometChat.BaseMessage): CometChatMessage => {
  const sender = message.getSender();
  const text = isTextMessage(message) ? message.getText() : "";

  return {
    id: String(message.getId()),
    text,
    senderUid: sender.getUid(),
    senderName: sender.getName(),
    sentAt: message.getSentAt(),
  };
};

const isUser = (value: CometChat.User | CometChat.Group): value is CometChat.User => {
  return value instanceof CometChat.User;
};

const mapConversation = (conversation: CometChat.Conversation): CometChatConversation => {
  const conversationWith = conversation.getConversationWith();
  const sdkLastMessage = conversation.getLastMessage();

  return {
    conversationId: conversation.getConversationId(),
    conversationWith: {
      uid: isUser(conversationWith) ? conversationWith.getUid() : conversationWith.getGuid(),
      name: conversationWith.getName(),
    },
    lastMessage: sdkLastMessage && isTextMessage(sdkLastMessage) ? mapMessage(sdkLastMessage) : undefined,
    unreadMessageCount: conversation.getUnreadMessageCount(),
  };
};

export const cometChatService = {
  async init(): Promise<void> {
    if (!APP_ID) {
      console.warn("[CometChat] No APP_ID set — messaging will be unavailable.");
      return;
    }

    const appSetting = new CometChat.AppSettingsBuilder()
      .subscribePresenceForAllUsers()
      .setRegion(REGION)
      .autoEstablishSocketConnection(true)
      .build();

    await CometChat.init(APP_ID, appSetting);
  },

  async createUser(uid: string, name: string): Promise<void> {
    if (!APP_ID) return;
    const user = new CometChat.User(uid);
    user.setName(name || uid);
    await CometChat.createUser(user, AUTH_KEY);
  },

  async login(uid: string, name?: string): Promise<void> {
    if (!APP_ID) return;
    try {
      await CometChat.login(uid, AUTH_KEY);
    } catch (err: any) {
      // UID doesn't exist in CometChat yet — create it and retry.
      if (err?.code === "ERR_UID_NOT_FOUND") {
        await this.createUser(uid, name || uid);
        await CometChat.login(uid, AUTH_KEY);
        return;
      }
      throw err;
    }
  },

  async logout(): Promise<void> {
    if (!APP_ID) return;
    await CometChat.logout();
  },

  async getConversations(): Promise<CometChatConversation[]> {
    if (!APP_ID) return [];

    const builder = new CometChat.ConversationsRequestBuilder().setLimit(30).build();
    const conversations = await builder.fetchNext();
    return conversations.map(mapConversation);
  },

  async getMessages(conversationUID: string): Promise<CometChatMessage[]> {
    if (!APP_ID) return [];

    const builder = new CometChat.MessagesRequestBuilder()
      .setUID(conversationUID)
      .setLimit(50)
      .build();

    const messages = await builder.fetchPrevious();
    // CometChat returns newest-first; the app contract expects oldest-first.
    return messages.map(mapMessage).reverse();
  },

  async sendTextMessage(
    receiverUID: string,
    text: string,
    receiverType: "user" | "group" = "user",
  ): Promise<CometChatMessage | undefined> {
    if (!APP_ID) return undefined;

    const message = new CometChat.TextMessage(receiverUID, text, receiverType);
    const sent = await CometChat.sendMessage(message);
    return mapMessage(sent);
  },

  addMessageListener(id: string, callbacks: MessageListenerCallbacks): void {
    if (!APP_ID) return;

    CometChat.addMessageListener(
      id,
      new CometChat.MessageListener({
        onTextMessageReceived: (msg: CometChat.TextMessage) =>
          callbacks.onTextMessageReceived(mapMessage(msg)),
      }),
    );
  },

  removeMessageListener(id: string): void {
    if (!APP_ID) return;
    CometChat.removeMessageListener(id);
  },
};
