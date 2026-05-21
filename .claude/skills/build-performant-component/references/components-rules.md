# Reference: component rules

Load this when the user asks "why this structure?", "why no data fetching?", "when should I memo?" — anything that's a question about the rules the skill enforces.

## The rules in one paragraph

A component in this codebase is dumb by construction. It takes props, returns JSX. It does not fetch data, does not import services or Firebase, does not own state that matters across renders. It references theme tokens by name (never `"#3478F6"` or `16`). It uses React Native Paper as the default UI primitive. It's small enough to delete and re-paste into another project unchanged.

## Why dumb components

Three reasons:

1. **Reusability.** A component that doesn't know where its data comes from works anywhere. Pass it different data, get different output. A component that imports `homeService` is married to that service forever.
2. **Testability.** A dumb component is rendered with synthetic props. No mocking. No setup. The test is just "render with these props, assert this output."
3. **Refactor blast radius.** When the data layer changes (swap Firebase for Supabase, change a query, add caching), dumb components are untouched. The blast radius is contained to hooks and views.

## Why theme tokens

The brand color appears in exactly one file: `src/theme/colors.ts`. Every component references `colors.primary`, not `"#3478F6"`. When the brand changes (or you build dark mode), one edit re-skins the whole app. Hardcoded values are silent bugs waiting to happen: when the brand changes, the team grep-fixes 90% of them and ships the last 10%.

## Why React Native Paper as default

Three reasons:

1. **Accessibility for free.** Paper's components ship with proper a11y attributes; rolling your own button means re-implementing that.
2. **Consistent visuals.** A Paper `<Button>` looks the same in every screen because the theme is applied globally. Custom buttons drift over time.
3. **Faster to write.** A `<Card>` is one import; a hand-rolled card is `<View>` + `<View>` + style objects + shadow params.

Reach for custom presentational components only when Paper doesn't have what you need.

## When to `memo`

Most components don't need `React.memo`. Add it when:

- **The component will render in a list of >20 items.** A list of 100 cards re-rendering every time the parent re-renders is real overhead.
- **The parent re-renders often with unchanged props for this child.** Memo prevents the re-render. Without that condition, memo is wasted work.
- **The render is non-trivial.** Lots of children, expensive layout calculations.

If none of those apply, **don't memo**. Memo is not a free safety blanket — it adds a comparison cost on every render. Unmemoized is the right default.

## When to use `useCallback` in the parent

Only after wrapping the child in `memo`. Without `memo` on the child, the child re-renders every time its parent does — so memoizing the callback in the parent does nothing useful (the child re-renders anyway). The two go together; alone, `useCallback` is noise.

## Anti-patterns this skill prevents

- **Component imports from `services/`.** Lift the data into a hook in the parent view; pass it as a prop.
- **Component uses `useState` for something load-bearing.** That state belongs in a hook.
- **Component hardcodes a hex color.** Use a theme token.
- **Component has a 14-prop API.** Compose smaller subcomponents (e.g., `<Card.Header>`, `<Card.Body>`).
