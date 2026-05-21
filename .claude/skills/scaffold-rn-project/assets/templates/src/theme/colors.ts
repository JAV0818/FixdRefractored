// Design tokens — colors.
//
// Components reference these names, never literal hex values. To swap a
// theme (dark mode, brand re-skin), change this file in one place and the
// whole app re-skins.

export const colors = {
  // Brand
  primary: "{{BRAND_COLOR}}",
  primaryDark: "#2A5FC2",
  onPrimary: "#FFFFFF",

  // Surfaces
  background: "#FFFFFF",
  surface: "#F7F8FA",
  surfaceElevated: "#FFFFFF",

  // Text
  textPrimary: "#0E1116",
  textSecondary: "#5B6470",
  textInverse: "#FFFFFF",

  // States
  success: "#22A06B",
  warning: "#E0A23A",
  error: "#D6394A",

  // Borders
  border: "#E6E8EC",
  borderStrong: "#C8CDD6",
} as const;

export type ColorToken = keyof typeof colors;
