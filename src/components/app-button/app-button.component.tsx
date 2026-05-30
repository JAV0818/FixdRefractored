// AppButton — the app's button, styled once per variant so callers never
// hand-set mode/buttonColor/textColor. Change a variant here and every button
// of that kind updates. Passes through all other Paper Button props
// (onPress, loading, disabled, icon, style, children, ...).

import { StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import type { ComponentProps } from "react";

import { colors } from "@/theme";

type PaperButtonProps = ComponentProps<typeof Button>;

export type AppButtonVariant = "primary" | "secondary" | "danger" | "tertiary";

type AppButtonProps = Omit<PaperButtonProps, "mode" | "buttonColor" | "textColor"> & {
  variant?: AppButtonVariant;
};

const VARIANTS: Record<
  AppButtonVariant,
  { mode: PaperButtonProps["mode"]; buttonColor?: string; textColor: string; bordered?: boolean }
> = {
  // Filled purple — the default, highest-emphasis action.
  primary: { mode: "contained", buttonColor: colors.primary, textColor: colors.onPrimary },
  // White surface with brand-colored text — secondary actions.
  secondary: { mode: "contained", buttonColor: colors.surface, textColor: colors.primary, bordered: true },
  // Filled red with white text — destructive actions (cancel / decline).
  danger: { mode: "contained", buttonColor: colors.danger, textColor: colors.onPrimary },
  // Text-only, muted — lowest-emphasis (Back, dismiss).
  tertiary: { mode: "text", textColor: colors.textSecondary },
};

export const AppButton = ({ variant = "primary", style, ...props }: AppButtonProps) => {
  const v = VARIANTS[variant];
  return (
    <Button
      mode={v.mode}
      buttonColor={v.buttonColor}
      textColor={v.textColor}
      style={[v.bordered && styles.bordered, style]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  bordered: {
    borderWidth: 1,
    borderColor: colors.outline,
  },
});
