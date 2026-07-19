// useUpdateProviderProfile — saves bio, specialties, and yearsExperience.
// Identity comes from auth context; the view supplies the new values.

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuthContext } from "@/providers/auth-provider";
import { userService } from "@/services/user-service";

type ProviderProfileInput = {
  bio: string;
  specialties: string[];
  yearsExperience: number;
};

export const useUpdateProviderProfile = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useAuthContext();
  return useMutation({
    mutationFn: (data: ProviderProfileInput) => {
      if (!currentUser) throw new Error("Not authenticated");
      return userService.updateProviderProfile(currentUser.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", currentUser?.id] });
    },
  });
};
