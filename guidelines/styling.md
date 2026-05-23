# Styling

Style with design tokens. The theme lives in `src/theme/`.

## The rule

You never write a literal color, pixel value, font size, or radius in a component file. Ever. They all come from the theme:

```tsx
// ❌ Wrong — hardcoded literals
const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#3478F6", borderRadius: 8 },
});

// ✅ Right — tokens
import { colors, radii, spacing } from "@/theme";

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
  },
});
```

This matters because: redesigns become cheap, dark mode is trivial, visual inconsistency is impossible by construction. The brand color you picked at scaffold time lives in exactly one file (`src/theme/colors.ts`) — change it once and the whole app re-skins.

## Tokens this project ships

| Token | Location | Examples |
|---|---|---|
| Colors | `src/theme/colors.ts` | `colors.primary`, `colors.background`, `colors.error` |
| Spacing | `src/theme/spacing.ts` | `spacing.xs`, `spacing.md`, `spacing.xl` |
| Typography | `src/theme/typography.ts` | `typography.title`, `typography.body` |
| Radii | `src/theme/radii.ts` | `radii.sm`, `radii.md`, `radii.pill` |

These are wired into the React Native Paper theme via `src/theme/index.ts`. Paper components automatically pick them up via the `PaperProvider` in `app/_layout.tsx`.

## Where styles go

For a component with non-trivial styling, styles live in a sibling `.styles.ts` file:

```
src/page/auth/components/auth-button/
  auth-button.component.tsx
  auth-button.styles.ts
  auth-button.interface.ts
  index.ts
```

For tiny components, inline `StyleSheet.create` inside the `.component.tsx` file is fine.

## Inline styles

Inline `style={{ ... }}` is fine for values that genuinely depend on props or runtime state:

- A progress bar's width based on a `progress` prop
- A conditional color based on an `isActive` prop

For static values, use `StyleSheet.create` so the styles can be parsed once and validated.

## Use Paper variants

When using Paper's `Text` component, prefer the `variant` prop over manual font styling:

```tsx
<Text variant="titleMedium">Profile</Text>
<Text variant="bodySmall">Last seen 2h ago</Text>
```

Paper's variants are already mapped to the theme's typography tokens.

## Layout

- **Flexbox only.** No `display: grid`, no `display: block`. There is no DOM.
- **Default `flexDirection` is `column`** — the opposite of CSS. Write `row` explicitly.
- **`gap` works on `View`** in modern RN. Use it instead of margin-collapsing through layouts.
- **`SafeAreaView`** from `react-native-safe-area-context` for any top-level view that touches screen edges. Phones have notches.

## Keyboard & input screens

Any screen that contains text inputs **must** use `KeyboardSafeView` as its root scrollable container. This is a shared app-wide component that handles `KeyboardAvoidingView` + `ScrollView` correctly on both iOS and Android, and accounts for the home indicator safe area at the bottom. Never roll your own `KeyboardAvoidingView` inline.

```tsx
import { KeyboardSafeView } from "@/components";

export const MyFormView = () => (
  <KeyboardSafeView contentContainerStyle={styles.content}>
    <TextInput ... />
    <Button ... />
  </KeyboardSafeView>
);
```

Props:
- `style` — applied to the outer `KeyboardAvoidingView`
- `contentContainerStyle` — applied to the `ScrollView` content container
- `scrollable` (default `true`) — set `false` for very short forms that don't need to scroll

## Anti-patterns

- **Hardcoded hex/px/rem literals in components.** Use tokens.
- **Importing colors from somewhere other than `@/theme`.** There's exactly one source.
- **Inline `style={{ ... }}` for static values.** Move to `StyleSheet.create`.
- **`style.css` files or CSS-in-JS libraries.** RN doesn't have them. Pretend they don't exist.
- **Rolling a custom `KeyboardAvoidingView` in a view or page.** Use `KeyboardSafeView` from `@/components` instead.
