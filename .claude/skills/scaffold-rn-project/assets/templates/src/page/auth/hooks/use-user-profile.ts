// useUserProfile — React Query read of the current user's profile.
//
// Demonstrates the four-state pattern (loading / error / empty / success)
// that views switch on.

import { useQuery } from "@tanstack/react-query";

import { userService } from "@/services/user-service";

export const useUserProfile = (userId: string | undefined) =>
  useQuery({
    queryKey: ["userProfile", userId],
    queryFn: () => userService.getProfile(userId!),
    enabled: !!userId,
  });
