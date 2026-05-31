// useUpdateAbout — mechanic saves their About section (bio + specialties).
// Identity comes from auth context; the view supplies the new values.

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuthContext } from "@/providers/auth-provider";
import { userService } from "@/services/user-service";

type AboutInput = {
  bio: string;
  specialties: string[];
};

export const useUpdateAbout = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useAuthContext();
  return useMutation({
    mutationFn: (about: AboutInput) => {
      if (!currentUser) throw new Error("Not authenticated");
      return userService.updateMechanicAbout(currentUser.id, about);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", currentUser?.id] });
    },
  });
};
