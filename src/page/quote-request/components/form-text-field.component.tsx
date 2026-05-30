// FormTextField — a react-hook-form Controller bound to the shared AppTextInput
// (which owns the input styling). Used by the text steps of the quote-request
// wizard.

import { memo } from "react";
import { StyleSheet } from "react-native";
import { Controller, type Control } from "react-hook-form";

import { AppTextInput } from "@/components";

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
        <AppTextInput
          label={label}
          placeholder={placeholder}
          value={value ?? ""}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          style={multiline ? styles.multiline : undefined}
        />
      )}
    />
  );
});

const styles = StyleSheet.create({
  multiline: {
    minHeight: 112,
  },
});
