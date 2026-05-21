// useUserProfile - React Query read of the current user's profile.
//
// React Query forbids returning undefined from a queryFn - it reserves that
// for "nothing fetched yet." A profile that does not exist becomes null.

import { useQuery } from "@tanstack/react-query";

import { userService } from "@/services/user-service";

import type { UserProfile } from "@/page/auth/interfaces/user-profile.interface";

export const useUserProfile = (userId: string | undefined) =>
  useQuery({
    queryKey: ["userProfile", userId],
    queryFn: async (): Promise<UserProfile | null> => {
      const profile = await userService.getProfile(userId!);
      return profile ?? null;
    },
    enabled: !!userId,
  });
