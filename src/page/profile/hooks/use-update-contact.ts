// useUpdateContact — save edits to the signed-in user's identity/contact fields.
// Identity comes from auth context; the view only supplies the new values.

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuthContext } from "@/providers/auth-provider";
import { userService } from "@/services/user-service";

type ContactInput = {
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
};

export const useUpdateContact = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useAuthContext();
  return useMutation({
    mutationFn: (info: ContactInput) => {
      if (!currentUser) throw new Error("Not authenticated");
      return userService.updateContactInfo(currentUser.id, info);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", currentUser?.id] });
    },
  });
};
