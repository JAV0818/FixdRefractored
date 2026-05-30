// AppTextInput — the app's text field, styled once (outlined, brand outline
// colors, white surface) with an optional inline error. Callers never set
// mode/outline colors. Passes through all other Paper TextInput props
// (label, value, onChangeText, keyboardType, multiline, secureTextEntry, ...).

import { StyleSheet, View } from "react-native";
import { HelperText, TextInput } from "react-native-paper";
import type { ComponentProps } from "react";

import { colors, spacing } from "@/theme";

type PaperInputProps = ComponentProps<typeof TextInput>;

type AppTextInputProps = Omit<
  PaperInputProps,
  "mode" | "error" | "outlineColor" | "activeOutlineColor"
> & {
  error?: string;
};

export const AppTextInput = ({ error, style, ...props }: AppTextInputProps) => (
  <View style={styles.field}>
    <TextInput
      mode="outlined"
      outlineColor={colors.outline}
      activeOutlineColor={colors.primary}
      error={!!error}
      style={[styles.input, style]}
      {...props}
    />
    {error ? <HelperText type="error">{error}</HelperText> : null}
  </View>
);

const styles = StyleSheet.create({
  field: {
    gap: spacing.xxs,
  },
  input: {
    backgroundColor: colors.surface,
  },
});
