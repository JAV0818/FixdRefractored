// AuthInput — labeled auth text field. Wraps the shared AppTextInput (which
// owns the input styling) and adds the auth form's bottom spacing.
//
// Dumb component: props in, events out. No data fetching, no services.

import { memo } from "react";
import { View } from "react-native";

import { AppTextInput } from "@/components";
import { spacing } from "@/theme";

const containerStyle = { marginBottom: spacing.sm };

type AuthInputProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address" | "numeric";
  secureTextEntry?: boolean;
  error?: string;
};

export const AuthInput = memo(function AuthInput({
  label,
  value,
  onChangeText,
  autoCapitalize = "none",
  keyboardType = "default",
  secureTextEntry = false,
  error,
}: AuthInputProps) {
  return (
    <View style={containerStyle}>
      <AppTextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        error={error}
      />
    </View>
  );
});
