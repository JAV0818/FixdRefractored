// AppTextInput — the app's text field, styled once (outlined, brand outline
// colors, white surface) with an optional inline error. Callers never set
// mode/outline colors. Passes through all other Paper TextInput props
// (label, value, onChangeText, keyboardType, multiline, secureTextEntry, ...).

import { StyleSheet, View } from "react-native";
import { HelperText, TextInput } from "react-native-paper";
import type { ComponentProps } from "react";
import type { StyleProp, ViewStyle } from "react-native";

import { colors, spacing } from "@/theme";

type PaperInputProps = ComponentProps<typeof TextInput>;

export type AppTextInputProps = Omit<
  PaperInputProps,
  "mode" | "error" | "outlineColor" | "activeOutlineColor"
> & {
  error?: string;
  // Style for the wrapper View (e.g. `flex: 1` to share a row). `style` still
  // goes to the inner TextInput.
  containerStyle?: StyleProp<ViewStyle>;
};

export const AppTextInput = ({ error, style, containerStyle, ...props }: AppTextInputProps) => (
  <View style={[styles.field, containerStyle]}>
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
