# Font vibe map

Curated mapping from "vibe descriptor" → recommended Google Fonts. Used by
theme-setup's typography analysis step when picking fonts to match a reference
image's character.

When Claude analyzes a reference image, it produces 1-3 vibe descriptors. This
file is the lookup table for translating those into specific Google Fonts.

If multiple vibes apply (e.g., "futuristic + minimal"), prefer fonts that
appear in BOTH lists. If none overlap, pick from the dominant vibe.

## Display fonts (headings, hero copy)

### futuristic / tech / cyber
- **Space Grotesk** — geometric, evenly-spaced, slight angle on terminals
- **Orbitron** — wide, angular, sci-fi staple
- **Chakra Petch** — semi-condensed, machined feel
- **Rajdhani** — narrow, technical, military-display vibe
- **Audiowide** — heavy, retrofuturistic, bold
- **Michroma** — wide, mono-feeling sans

### geometric / minimal / modernist
- **Inter** — neutral, optimized for screens, used by Linear, Vercel
- **Manrope** — friendly geometric, modern, balanced
- **DM Sans** — clean, geometric, slight humanist warmth
- **Sora** — modernist sans with subtle character
- **Plus Jakarta Sans** — geometric with personality

### bold / brutalist / heavy
- **Archivo Black** — extra-bold, condensed, statement
- **Bebas Neue** — narrow, all-caps display
- **Anton** — heavy, condensed, headline
- **Russo One** — bold, slightly angular
- **Unbounded** — variable, modern brutalist

### editorial / luxe / elegant
- **Playfair Display** — high-contrast serif, classic editorial
- **Cormorant** — fine, narrow serif, magazine-grade
- **DM Serif Display** — bold serif, soft-modern
- **Libre Caslon Display** — clean classic serif
- **Fraunces** — variable, expressive serif with optical sizing

### playful / friendly / approachable
- **Quicksand** — rounded geometric sans, soft
- **Comfortaa** — fully rounded, gentle
- **Fredoka** — rounded, slightly bold, casual
- **Nunito** — rounded humanist sans
- **Mulish** — minimal, friendly

### handwritten / organic / personal
- **Caveat** — casual handwriting
- **Kalam** — natural handwriting
- **Indie Flower** — relaxed script
- **Architects Daughter** — engineering-notebook script

### retro / nostalgic / vintage
- **Major Mono Display** — mono with retro feel
- **DotGothic16** — pixelated, dot-matrix
- **VT323** — terminal/typewriter
- **Press Start 2P** — 8-bit pixel

## Body fonts (paragraph text, UI labels)

For body, prioritize legibility at small sizes over personality.

### Universal defaults (work for almost any vibe)
- **Inter** — the safe choice. Screen-optimized, neutral.
- **Manrope** — slightly more character than Inter, still neutral.
- **DM Sans** — similar to Inter, slightly more geometric.

### Pair with editorial / serif display
- **Source Sans 3** — clean humanist, pairs well with serifs
- **Lato** — humanist, friendly
- **Open Sans** — workhorse, very legible

### Pair with futuristic / tech display
- **Inter** — still works (most tech apps use Inter)
- **IBM Plex Sans** — technical character
- **Roboto** — Material default, neutral

### Pair with playful / rounded display
- **Nunito Sans** — rounded humanist, matches rounded display
- **Mulish** — minimal, soft

## Mono fonts (code blocks, technical readouts, numerals)

- **JetBrains Mono** — programmer-favorite, very legible, ligature support
- **Fira Code** — ligatures, broad character set
- **IBM Plex Mono** — technical character, matches IBM Plex Sans
- **Space Mono** — slightly retro, distinctive
- **Roboto Mono** — neutral, Material companion
- **Source Code Pro** — clean, legible

## Picking strategy

1. **Start with display** — the display font sets the app's character. Pick it first from the vibe map.
2. **Pick body to support display** — usually pair display with a neutral body (Inter / Manrope / DM Sans). Avoid two opinionated fonts; one should be the workhorse.
3. **Mono is optional** — only include if the app shows code, metrics, or technical readouts.

## Weight profiles

The skill picks weight ranges based on the reference image's overall density:

- **light** — references use thin/regular weights, lots of whitespace. Weights: 300/400/500/700.
- **balanced** — standard weights. Weights: 400/500/600/700.
- **heavy** — references use bold/extrabold prominently. Weights: 500/600/700/800.

## Fallbacks

If Claude's analysis is uncertain or no clear vibe emerges:
- Display: **Manrope** (medium-bold weights)
- Body: **Inter** (regular/medium weights)
- Mono: **JetBrains Mono** (regular weight, only if mono is needed)

This trio is the safe default that looks correct on any modern app.
