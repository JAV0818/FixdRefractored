// SignOutButton — a small header icon button for signing out. Dumb: the caller
// supplies the press handler and pending state.

import { memo } from "react";
import { IconButton } from "react-native-paper";

import { colors } from "@/theme";

type SignOutButtonProps = {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export const SignOutButton = memo(function SignOutButton({
  onPress,
  loading,
  disabled,
}: SignOutButtonProps) {
  return (
    <IconButton
      icon="logout"
      iconColor={colors.textSecondary}
      onPress={onPress}
      disabled={disabled}
      loading={loading}
      size={22}
    />
  );
});
