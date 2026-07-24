// Syncs the signed-in user's CometChat profile from Firestore once auth + CometChat
// are initialized. This is a renderless component.

import { useSyncCometChatProfile } from "@/page/chat/hooks/use-sync-comet-chat-profile";

export const SyncCometChatProfile = () => {
  useSyncCometChatProfile();
  return null;
};
