// useToggleAvailability — mechanic flips their "available for jobs" flag.
// Identity comes from auth context; the view passes the desired next value.

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuthContext } from "@/providers/auth-provider";
import { userService } from "@/services/user-service";

export const useToggleAvailability = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useAuthContext();
  return useMutation({
    mutationFn: (isAvailable: boolean) => {
      if (!currentUser) throw new Error("Not authenticated");
      return userService.setAvailability(currentUser.id, isAvailable);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", currentUser?.id] });
    },
  });
};
