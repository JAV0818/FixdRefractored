// Syncs the signed-in user's CometChat profile (name/avatar) from their Firestore
// profile whenever it changes. Keeps conversation headers and avatars readable.

import { useEffect } from "react";

import { useAuthContext } from "@/providers/auth-provider";
import { useUserProfile } from "@/page/auth/hooks/use-user-profile";
import { cometChatService } from "@/services/comet-chat-service";

export const useSyncCometChatProfile = () => {
  const { currentUser } = useAuthContext();
  const { data: profile } = useUserProfile(currentUser?.id);

  useEffect(() => {
    if (!currentUser || !profile) return;

    const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim();
    const displayName = fullName || profile.email || currentUser.id;

    cometChatService.updateCurrentUser(displayName, profile.photoUrl ?? undefined).catch((err) => {
      console.warn("[useSyncCometChatProfile] sync failed:", err);
    });
  }, [currentUser, profile]);
};
