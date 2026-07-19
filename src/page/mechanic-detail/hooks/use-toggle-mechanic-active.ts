// useToggleMechanicActive — owner/admin flips a mechanic's isActive flag.
// Invalidates both the single mechanic query and the mechanics list.

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { userService } from "@/services/user-service";

type ToggleArgs = {
  providerId: string;
  isActive: boolean;
};

export const useToggleMechanicActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ providerId, isActive }: ToggleArgs) =>
      userService.toggleMechanicActive(providerId, isActive),
    onSuccess: (_data, { providerId }) => {
      queryClient.invalidateQueries({ queryKey: ["mechanic", providerId] });
      queryClient.invalidateQueries({ queryKey: ["mechanics"] });
    },
  });
};
