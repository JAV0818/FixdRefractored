// FormTextField — a react-hook-form Controller bound to a Paper TextInput,
// with inline error text. Used by the text steps of the quote-request wizard.

import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { HelperText, TextInput } from "react-native-paper";
import { Controller, type Control } from "react-hook-form";

import { colors, spacing } from "@/theme";

import type { QuoteRequestForm } from "../interfaces/quote-request.interface";

// Only the free-text fields — `categories` is handled by CategoryChips.
type StringField = "description" | "vehicleInfo" | "address" | "city" | "state" | "zip";

type FormTextFieldProps = {
  control: Control<QuoteRequestForm>;
  name: StringField;
  label: string;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: "default" | "numeric";
  autoCapitalize?: "none" | "words" | "characters" | "sentences";
};

export const FormTextField = memo(function FormTextField({
  control,
  name,
  label,
  placeholder,
  multiline = false,
  keyboardType = "default",
  autoCapitalize = "sentences",
}: FormTextFieldProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
        <View style={styles.field}>
          <TextInput
            label={label}
            placeholder={placeholder}
            value={value ?? ""}
            onChangeText={onChange}
            onBlur={onBlur}
            mode="outlined"
            error={!!error}
            multiline={multiline}
            numberOfLines={multiline ? 4 : 1}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            style={[styles.input, multiline && styles.multiline]}
            outlineColor={colors.outline}
            activeOutlineColor={colors.primary}
          />
          {!!error && <HelperText type="error">{error.message}</HelperText>}
        </View>
      )}
    />
  );
});

const styles = StyleSheet.create({
  field: {
    gap: spacing.xxs,
  },
  input: {
    backgroundColor: colors.surface,
  },
  multiline: {
    minHeight: 112,
  },
});
