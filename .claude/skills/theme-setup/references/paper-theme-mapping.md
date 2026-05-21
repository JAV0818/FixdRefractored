# Paper theme mapping

How theme-setup's semantic tokens map to React Native Paper's MD3Theme shape.

## Why this mapping exists

Paper's MD3Theme has a fixed set of color slots (primary, secondary, tertiary,
surface, surfaceVariant, etc.) following Material Design 3. Our semantic tokens
are richer and more app-oriented (primary, secondary, accent, surfaceVariant,
textPrimary, textSecondary, danger, success, etc.).

The mapping below is how we collapse our tokens into Paper's slots without
losing the extra ones. Components that use Paper components (Button, Card,
TextInput, etc.) automatically get themed via Paper's slots. Components that
want our extras (danger, success, accent) import directly from `colors.ts`.

## Color slot mapping

| Our token          | Paper slot                | Notes |
|--------------------|---------------------------|-------|
| `primary`          | `colors.primary`          | Main brand color |
| `secondary`        | `colors.secondary`        | Supporting brand |
| `accent`           | `colors.tertiary`         | Paper's "tertiary" slot |
| `background`       | `colors.background`       | Screen background |
| `surface`          | `colors.surface`          | Card / sheet background |
| `surfaceVariant`   | `colors.surfaceVariant`   | Subtle surface differentiation |
| `outline`          | `colors.outline`          | Borders, dividers |
| `textPrimary`      | `colors.onSurface`, `colors.onBackground` | Foreground text |
| `textSecondary`    | `colors.onSurfaceVariant` | Muted text |
| `danger`           | `colors.error`            | Errors, destructive |
| `success`          | (custom, not in Paper)    | Import from `colors.ts` directly |
| `warning`          | (custom, not in Paper)    | Import from `colors.ts` directly |
| `info`             | (custom, not in Paper)    | Import from `colors.ts` directly |

## "on" colors (foreground on a colored surface)

Paper requires every color slot to have an `on*` companion (the readable
foreground when the color is used as a background). We compute these from
contrast — for solid brand colors, `onPrimary` is usually the background
color (white text on a saturated primary, etc.).

The theme.ts template handles this automatically:

```ts
onPrimary: lightColors.background,        // text on primary background
onSecondary: lightColors.background,      // text on secondary background
onSurface: lightColors.textPrimary,       // text on surface
onSurfaceVariant: lightColors.textSecondary,
```

If your primary color is very light (e.g., a pastel), this rule breaks — you'd
want dark text on a light primary. In that case, override `onPrimary` in
`theme.ts` manually after generation.

## Typography mapping

Paper's typography slots (M3 type scale):

| Paper slot          | Our usage                              |
|---------------------|----------------------------------------|
| `displayLarge`      | Hero / splash text (rarely used)      |
| `displayMedium`     | Section openers                       |
| `displaySmall`      | Sub-section openers                   |
| `headlineLarge`     | Page titles                           |
| `headlineMedium`    | Card titles                           |
| `headlineSmall`     | List section titles                   |
| `titleLarge`        | Modal / sheet titles                  |
| `titleMedium`       | Card subtitles, prominent labels      |
| `titleSmall`        | Form field labels                     |
| `bodyLarge`         | Lead paragraphs                       |
| `bodyMedium`        | Default body text                     |
| `bodySmall`         | Captions, helper text                 |
| `labelLarge`        | Buttons, prominent labels             |
| `labelMedium`       | Tab labels, small UI labels           |
| `labelSmall`        | Overline / micro-labels               |

Display + headline slots use the display fontFamily. Title + body slots use
the body fontFamily. Label slots use the body fontFamily with wider letter-
spacing for legibility at small sizes.

## When components don't use Paper

If you write a custom component (via `build-performant-component`), it won't
automatically be themed by Paper. The pattern is:

```tsx
import { useTheme } from "react-native-paper";

export const Foo = memo(function Foo() {
  const { colors } = useTheme();
  return <View style={{ backgroundColor: colors.surface }} />;
});
```

For our custom tokens (success, warning, info), import directly:

```tsx
import { useTheme } from "react-native-paper";
import { lightColors, darkColors } from "@/theme/colors";

export const Foo = memo(function Foo() {
  const theme = useTheme();
  const palette = theme.dark ? darkColors : lightColors;
  return <View style={{ backgroundColor: palette.success }} />;
});
```

The showcase route demonstrates this pattern.
