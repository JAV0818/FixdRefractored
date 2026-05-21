---
name: theme-setup
description: Generates a complete design system (colors, typography, spacing, radii, shadows) for a React Native Paper plus Expo project from reference images and/or a Figma file. Trigger on phrases like "set up the theme", "style my app like X", "apply this design", "use this reference for the look", "match my Figma", "build the design system from these mockups". Accepts MULTIPLE reference images plus an optional Figma URL, synthesizing a unified palette and typography across all signals. Writes src/theme/* files, installs @expo-google-fonts packages, wires PaperProvider, and generates a /theme-showcase route. Hybrid analysis: Python (Pillow plus colorthief) for color extraction, Claude vision for typography vibe, Figma REST API for designer-declared tokens. Do NOT use for: single-color picking, Tailwind config (RN does not use Tailwind), or web-only theming.
---

# theme-setup

Generate a working React Native Paper theme from real visual references. Replaces "I picked a brand color and shipped Paper's default theme" with "I gave the skill 3 reference images + a Figma link, it extracted the palette, picked Google Fonts that match the vibe, and wired everything into PaperProvider."

## What this skill produces

In the target project:

```
<project>/
├── src/
│   └── theme/
│       ├── colors.ts            semantic color tokens (primary, surface, etc.)
│       ├── typography.ts        font families, weights, sizes, line-heights
│       ├── spacing.ts           4pt-grid spacing scale
│       ├── radii.ts             border-radius scale
│       ├── shadows.ts           elevation / shadow tokens
│       ├── theme.ts             Paper MD3Theme composition (imports all of above)
│       └── theme-showcase.tsx   dev-only route showing every token in use
├── app/
│   ├── _layout.tsx              UPDATED — wraps PaperProvider with new theme + useFonts gate
│   └── theme-showcase.tsx       hidden dev route that renders the showcase view
└── package.json                 UPDATED — @expo-google-fonts/<family> added
```

Plus a `theme-setup-report.md` in the project root summarizing the decisions made (palette source, font choices, conflicts surfaced, etc.) so the user can audit and tweak.

## Inputs

The skill accepts ANY combination of:

1. **Reference images** — file paths or URLs, ONE OR MORE. Pasted-into-chat images also work.
2. **Figma URL** — file URL, page URL, or specific frame URL.
3. **Brand-color seed** — optional `#RRGGBB` hex anchor. The skill will prefer this color as the primary if it can be reconciled with the references.
4. **Mode** — `light`, `dark`, or `auto` (light + dark variants generated). Default: inferred from references.

At least ONE of (images, Figma URL, brand-color seed) is required.

## When to use this skill

Examples that should trigger this skill:

- "Set up the theme for my app using these references" + 2 images attached
- "Style Fixd like this Figma file: figma.com/..."
- "Generate the design system from this mockup"
- "I want this app to look like the AURA FLEET aesthetic — here are 3 reference shots"
- "Apply this color palette and pick fonts that match"

Examples that should NOT trigger this skill:

- "Change the primary color to #FF0000" → edit src/theme/colors.ts directly.
- "Add a button component" → use `build-performant-component`.
- "What color should I use?" → conversational, no skill invocation.
- "Tailwind config" → wrong stack; this skill is RN Paper only.

## How to use this skill

### Step 1 — Gather the inputs

Ask the user (skip questions they've already answered):

1. **Project location?** (default: current working directory) Must contain `app/_layout.tsx` and `package.json` with `react-native-paper` listed. The skill refuses to run on a non-Paper project.
2. **Reference images?** (paths, URLs, or "use what I pasted") If the user dragged images into the chat, list them back and confirm.
3. **Figma URL?** (optional) If provided, prompt for a Figma personal access token unless `FIGMA_TOKEN` is already in the project's `.env`. Store it in `.env` (not committed) on first use.
4. **Brand-color seed?** (optional `#RRGGBB`) Skipped if not relevant.
5. **Mode?** Light / Dark / Auto. Default: auto-detect from references.

If the user provides ZERO references and ZERO Figma URL but does provide a brand-color seed, the skill runs in "color-only" mode — synthesizes the palette from that single hex, picks neutral Google Fonts (Inter for body, Manrope for display), and writes the theme files. Fast path for users who don't have references.

### Step 2 — Confirm the plan

Echo back what the skill is about to do:

> About to generate a theme for `<project-path>`:
> - **References**: 3 images (`aura-1.png`, `aura-2.png`, `aura-3.png`)
> - **Figma**: figma.com/file/abc123 (page: Home)
> - **Brand seed**: #3DDBFF
> - **Mode**: dark
>
> This will write 6 files to `src/theme/`, update `app/_layout.tsx`, add `/theme-showcase` route, and install 2 Google Fonts packages. The existing theme (if any) will be backed up to `src/theme.backup-<timestamp>/`.
>
> Proceed? (y / change something)

### Step 3 — Run the analysis (hybrid)

Three parallel passes:

**3a. Color extraction (Python, deterministic)** — `scripts/extract_colors.py --images <paths...> --brand-seed <hex?>`. Uses Pillow + colorthief to pull a 5-7 color palette per image, clusters across images, snaps to a semantic palette: `primary`, `secondary`, `accent`, `background`, `surface`, `surface-variant`, `text-primary`, `text-secondary`, `text-disabled`, `outline`, `danger`, `success`. Outputs `colors.json`.

**3b. Typography + vibe analysis (Claude vision)** — Claude looks at each image and proposes:
- **Typography style**: geometric sans / humanist sans / serif / display / mono accents.
- **Font weight profile**: heavy / regular / light.
- **Character**: futuristic / soft / brutalist / editorial / corporate / playful.
- **Spacing rhythm**: tight / balanced / airy.
- **Recommended Google Fonts** (2-3 options per role: display, body, mono).

Claude writes its analysis to `typography-analysis.md` for transparency. The user can intervene at this step.

**3c. Figma sync (Python, optional)** — `scripts/fetch_figma.py --url <figma-url> --token <pat>` if Figma URL provided. Pulls color styles + text styles + effect styles. Designer-declared tokens override Python's extracted tokens (designer knows what they want; we're just picking up signals from images otherwise).

### Step 4 — Synthesize + surface conflicts

The skill merges the three signals. Where they agree, ship the result. Where they conflict, ask the user to pick:

> Color conflict: image #2 dominant accent is #FF6B6B (coral), your brand seed is #3DDBFF (cyan). Which should be `accent`?
>
> Typography conflict: Claude suggests Manrope (geometric sans) based on the image vibe, Figma file declares Inter as the body font. Which do you want as `fontFamily.body`?

Default: prefer designer-declared (Figma) > brand seed > image-derived. Always lets the user override.

### Step 5 — Generate files

Run `scripts/generate_theme.py` with the synthesized tokens. Outputs the full `src/theme/*` tree. Then `scripts/install_fonts.py` runs `npm install @expo-google-fonts/<family>` for each chosen font.

### Step 6 — Wire the theme

Update `app/_layout.tsx`:
- Add `useFonts({ ... })` hook gated render
- Wrap the navigator in `<PaperProvider theme={appTheme}>` importing from `src/theme/theme`
- Add a `<Stack.Screen name="theme-showcase" />` to the stack

Add `app/theme-showcase.tsx` route that renders `src/theme/theme-showcase.tsx` (the visual reference page).

### Step 7 — Write the report + next steps

Write `theme-setup-report.md` in the project root:
- Inputs used (image paths, Figma URL, brand seed, mode)
- Palette extracted (color name → hex, with role assigned)
- Fonts installed (family + weights + usage role)
- Conflicts encountered + how they were resolved
- Files written / updated

Then show the user:

> Theme generated for `<project>`. Next steps:
> 1. Run `npm install` to pull in the new font packages.
> 2. Run `npm run dev` and visit `/theme-showcase` to see every token in use.
> 3. Edit any token in `src/theme/*` to fine-tune. The showcase route reflects changes live.
> 4. If you want to iterate, re-run this skill with different inputs — your previous theme is backed up at `src/theme.backup-<timestamp>/`.

## Why this skill exists

Without it, every scaffolded app looks the same (Paper's default Material You theme) until the dev manually picks colors, fonts, sizes, and writes 200+ lines of theme code. Most non-pro devs (the course's audience) never finish this step — they ship the default theme. With it, "give the skill your references" → "your app has a real visual identity" is a 60-second turnaround.

It's also the layer where the course teaches **design tokens as a first-class concern**. Hardcoding `color="#3DDBFF"` is the wrong instinct — tokens are. By making the skill the easiest path to a styled app, students learn the right pattern by default.

## Reference files

- `references/font-vibes.md` — Mapping of "vibe descriptors" (futuristic / soft / brutalist / etc.) → recommended Google Font options. Load when picking fonts.
- `references/paper-theme-mapping.md` — How our semantic tokens map to React Native Paper's MD3Theme structure (some tokens like `surface-variant` are Paper-specific, others are our additions).
- `references/figma-api-quickstart.md` — Figma REST API authentication + the specific endpoints we hit (color styles, text styles, file thumbnails). Load when debugging Figma sync.

## Limitations / known issues

- **Custom paid fonts** (Pangram, Apoc, anything not on Google Fonts) require the user to drop `.ttf` files into `assets/fonts/`. The skill writes the `useFonts({ "Custom": require(...) })` wiring but can't fetch the file for them.
- **Figma free tier** rate-limits the API; if the user has a huge file, the skill may need 2-3 retries. Token caching helps.
- **Image quality matters** for color extraction — screenshots from Figma render fine, JPEGs with heavy compression artifacts may produce muddy palettes. The skill warns when input image quality looks degraded.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                             