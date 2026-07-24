// Syncs the signed-in user's CometChat profile (name/avatar) from their Firestore
// profile whenever it changes. Keeps conversation headers and avatars readable.

import { useEffect, useRef } from "react";

import { useAuthContext } from "@/providers/auth-provider";
import { useUserProfile } from "@/page/auth/hooks/use-user-profile";
import { useCometChatContext } from "@/providers/comet-chat-provider";
import { cometChatService } from "@/services/comet-chat-service";

const SYNC_RETRY_MS = 2_000;
const SYNC_MAX_RETRIES = 15;

export const useSyncCometChatProfile = () => {
  const { currentUser } = useAuthContext();
  const { data: profile } = useUserProfile(currentUser?.id);
  const { isCometChatReady } = useCometChatContext();
  const syncedRef = useRef(false);

  useEffect(() => {
    if (!isCometChatReady || !currentUser || !profile) return;

    const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim();
    const displayName = fullName || profile.email || currentUser.id;

    let attempts = 0;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const trySync = async () => {
      if (cancelled) return;

      try {
        await cometChatService.updateCurrentUser(displayName, profile.photoUrl ?? undefined);
        syncedRef.current = true;
      } catch (err) {
        if (cancelled) return;
        attempts += 1;
        if (attempts <= SYNC_MAX_RETRIES) {
          timeoutId = setTimeout(trySync, SYNC_RETRY_MS);
        } else {
          console.warn("[useSyncCometChatProfile] sync failed after retries:", err);
        }
      }
    };

    // Only run once per auth/profile change. A fresh login resets the provider
    // tree, so this effect re-runs and syncedRef is back to false.
    if (!syncedRef.current) {
      trySync();
    }

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isCometChatReady, currentUser, profile]);
};
