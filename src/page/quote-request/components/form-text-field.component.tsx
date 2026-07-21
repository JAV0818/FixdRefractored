// FormTextField — a react-hook-form Controller bound to the shared AppTextInput
// (which owns the input styling). Used by the text steps of the quote-request
// wizard.

import { memo } from "react";
import { StyleSheet } from "react-native";
import { Controller, type Control } from "react-hook-form";

import { AppTextInput, MultilineTextInput } from "@/components";

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
      render={({ field: { value, onChange, onBlur }, fieldState: { error } }) =>
        multiline ? (
          <MultilineTextInput
            label={label}
            placeholder={placeholder}
            value={value ?? ""}
            onChangeText={onChange}
            onBlur={onBlur}
            error={error?.message}
            numberOfLines={4}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            style={styles.multiline}
          />
        ) : (
          <AppTextInput
            label={label}
            placeholder={placeholder}
            value={value ?? ""}
            onChangeText={onChange}
            onBlur={onBlur}
            error={error?.message}
            numberOfLines={1}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
          />
        )
      }
    />
  );
});

const styles = StyleSheet.create({
  multiline: {
    minHeight: 112,
  },
});
