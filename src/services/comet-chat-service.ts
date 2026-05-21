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
//
// TODO: Run `npm install @cometchat/chat-sdk-react-native` and uncomment
// the real imports below once you have your CometChat App ID from
// https://app.cometchat.com

// ─── Uncomment once SDK is installed ────────────────────────────────────────
// import { CometChat } from "@cometchat/chat-sdk-react-native";
// ────────────────────────────────────────────────────────────────────────────

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

export const cometChatService = {
  async init(): Promise<void> {
    if (!APP_ID) {
      console.warn("[CometChat] No APP_ID set — messaging will be unavailable.");
      return;
    }
    // Uncomment once SDK is installed:
    // const appSetting = new CometChat.AppSettingsBuilder()
    //   .subscribePresenceForAllUsers()
    //   .setRegion(REGION)
    //   .autoEstablishSocketConnection(true)
    //   .build();
    // await CometChat.init(APP_ID, appSetting);
    console.log("[CometChat] Init stub called — SDK not yet installed.");
  },

  async login(uid: string): Promise<void> {
    if (!APP_ID) return;
    // Uncomment once SDK is installed:
    // await CometChat.login(uid, AUTH_KEY);
    console.log("[CometChat] Login stub called for uid:", uid);
  },

  async logout(): Promise<void> {
    if (!APP_ID) return;
    // Uncomment once SDK is installed:
    // await CometChat.logout();
    console.log("[CometChat] Logout stub called.");
  },

  async getConversations(): Promise<CometChatConversation[]> {
    if (!APP_ID) return [];
    // Uncomment once SDK is installed:
    // const builder = new CometChat.ConversationsRequestBuilder().setLimit(30).build();
    // const conversations = await builder.fetchNext();
    // return conversations.map(mapConversation);
    return [];
  },

  async getMessages(conversationUID: string): Promise<CometChatMessage[]> {
    if (!APP_ID) return [];
    // Uncomment once SDK is installed:
    // const builder = new CometChat.MessagesRequestBuilder()
    //   .setUID(conversationUID)
    //   .setLimit(50)
    //   .build();
    // const messages = await builder.fetchPrevious();
    // return messages.map(mapMessage);
    return [];
  },

  async sendTextMessage(
    receiverUID: string,
    text: string,
    receiverType: "user" | "group" = "user",
  ): Promise<CometChatMessage | undefined> {
    if (!APP_ID) return undefined;
    // Uncomment once SDK is installed:
    // const message = new CometChat.TextMessage(receiverUID, text, receiverType);
    // const sent = await CometChat.sendMessage(message);
    // return mapMessage(sent);
    console.log("[CometChat] sendTextMessage stub:", { receiverUID, text });
    return undefined;
  },

  addMessageListener(id: string, callbacks: MessageListenerCallbacks): void {
    if (!APP_ID) return;
    // Uncomment once SDK is installed:
    // CometChat.addMessageListener(
    //   id,
    //   new CometChat.MessageListener({
    //     onTextMessageReceived: (msg) => callbacks.onTextMessageReceived(mapMessage(msg)),
    //   }),
    // );
  },

  removeMessageListener(id: string): void {
    if (!APP_ID) return;
    // Uncomment once SDK is installed:
    // CometChat.removeMessageListener(id);
  },
};
