// Wires the design tokens into a React Native Paper MD3 theme.
//
// Components import primitives like `colors.primary` and `spacing.md`
// directly from this barrel. Paper components pick up the theme via the
// PaperProvider in src/providers/app-providers.tsx.

import { MD3LightTheme } from "react-native-paper";

import { colors } from "./colors";
import { radii } from "./radii";
import { spacing } from "./spacing";
import { typography } from "./typography";

export { colors, radii, spacing, typography };

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    onPrimary: colors.onPrimary,
    background: colors.background,
    surface: colors.surface,
    onSurface: colors.textPrimary,
    error: colors.error,
    outline: colors.border,
  },
  // Custom extensions accessible at theme.app.<token>
  app: {
    colors,
    spacing,
    typography,
    radii,
  },
};

export type AppTheme = typeof theme;
