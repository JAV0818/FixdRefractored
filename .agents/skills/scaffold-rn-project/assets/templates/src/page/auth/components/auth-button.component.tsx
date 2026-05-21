// AuthButton — primary action button with loading/disabled support.
//
// Dumb component: props in, events out. Wrapped in memo because auth
// flows re-render their forms on every keystroke; we don't need the
// submit button re-rendering with them.

import { memo } from "react";
import { Button } from "react-native-paper";

import { spacing } from "@/theme";

const buttonStyle = { marginTop: spacing.sm };

type AuthButtonProps = {
  label: string;
  isLoading?: boolean;
  disabled?: boolean;
  onPress: () => void;
};

export const AuthButton = memo(function AuthButton({
  label,
  isLoading = false,
  disabled = false,
  onPress,
}: AuthButtonProps) {
  return (
    <Button
      mode="contained"
      loading={isLoading}
      disabled={disabled || isLoading}
      onPress={onPress}
      style={buttonStyle}
    >
      {label}
    </Button>
  );
});
