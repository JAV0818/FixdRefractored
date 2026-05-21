// AuthInput — labeled text input with optional inline error helper.
//
// Dumb component: props in, events out. No data fetching, no services.

import { memo } from "react";
import { View } from "react-native";
import { HelperText, TextInput } from "react-native-paper";

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
      <TextInput
        mode="outlined"
        label={label}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        error={!!error}
      />
      {error ? <HelperText type="error">{error}</HelperText> : null}
    </View>
  );
});
