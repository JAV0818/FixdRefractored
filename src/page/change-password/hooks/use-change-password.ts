// useChangePassword — reauthenticates the user then updates their Firebase Auth
// password. Firebase requires re-auth before sensitive operations.

import { useMutation } from "@tanstack/react-query";

import { authService } from "@/services/auth-service";

type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export const useChangePassword = () =>
  useMutation({
    mutationFn: ({ currentPassword, newPassword }: ChangePasswordInput) =>
      authService.changePassword(currentPassword, newPassword),
  });
