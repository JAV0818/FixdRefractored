import { useMutation } from "@tanstack/react-query";

import { useAuthContext } from "@/providers/auth-provider";
import { userService } from "@/services/user-service";

type MechanicProfileInput = {
  bio: string;
  specialties: string[];
  yearsExperience: number;
};

export const useSaveMechanicProfile = () => {
  const { currentUser } = useAuthContext();
  return useMutation({
    mutationFn: (profile: MechanicProfileInput) => {
      if (!currentUser) throw new Error("Not authenticated");
      return userService.saveMechanicProfile(currentUser.id, profile);
    },
  });
};
