// useUpdateAvatar — uploads a newly picked profile photo to Storage, then writes
// the resulting URL onto the user doc. Identity comes from auth context.

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuthContext } from "@/providers/auth-provider";
import { storageService } from "@/services/storage-service";
import { userService } from "@/services/user-service";

export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useAuthContext();
  return useMutation({
    mutationFn: async (uri: string): Promise<string> => {
      if (!currentUser) throw new Error("Not authenticated");
      const photoUrl = await storageService.uploadAvatar(currentUser.id, uri);
      await userService.updatePhotoUrl(currentUser.id, photoUrl);
      return photoUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", currentUser?.id] });
    },
  });
};
