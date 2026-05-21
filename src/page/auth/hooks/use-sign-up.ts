// useSignUp — React Query mutation wrapping authService.signUp.

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authService } from "@/services/auth-service";

import type { SignUpCredentials } from "../interfaces/auth-credentials.interface";

export const useSignUp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentials: SignUpCredentials) => authService.signUp(credentials),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
};
