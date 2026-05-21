#!/usr/bin/env python3
"""generate_theme.py — Renders the theme files into a target project.

Inputs:
  --project <path>             target project root (must contain app/, src/)
  --colors <path>              colors.json from extract_colors.py
  --typography <path>          typography.json from Claude's vision analysis
  --figma <path>               figma.json from fetch_figma.py (optional)
  --default-mode <mode>        which theme is the default (light / dark)
  --templates <path>           templates dir (defaults to ../assets/templates)
  --backup / --no-backup       backup existing src/theme/ before writing

What it does:
  1. Synthesizes final token values (figma > brand seed > extracted > defaults)
  2. Reads each .template file, substitutes {{TOKENS}}, writes to src/theme/
  3. Generates app/theme-showcase.tsx pointing at the showcase view
  4. Writes theme-setup-report.md in the project root
  5. Prints a list of @expo-google-fonts/* packages to install (caller does npm)
"""

from __future__ import annotations
import argparse, datetime, json, shutil, sys
from pathlib import Path
from typing import Any


SCRIPT_DIR = Path(__file__).resolve().parent
DEFAULT_TEMPLATES = SCRIPT_DIR.parent / "assets" / "templates"


# ---------- Default values when input is sparse ----------

DEFAULT_LIGHT_COLORS = {
    "primary": "#3478F6",
    "secondary": "#7C5CFF",
    "accent": "#FF6B6B",
    "background": "#FFFFFF",
    "surface": "#F7F8FA",
    "surface_variant": "#EEF0F4",
    "text_primary": "#0A0E1A",
    "text_secondary": "#5A6275",
    "text_disabled": "#A0A8B8",
    "outline": "#D6D9E0",
    "danger": "#FF5A5A",
    "success": "#3DD68C",
    "warning": "#FFB547",
    "info": "#3478F6",
}

DEFAULT_DARK_COLORS = {
    "primary": "#3DDBFF",
    "secondary": "#7C5CFF",
    "accent": "#FF6B6B",
    "background": "#0A0E1A",
    "surface": "#141823",
    "surface_variant": "#1E2330",
    "text_primary": "#FFFFFF",
    "text_secondary": "#A0A8B8",
    "text_disabled": "#5A6275",
    "outline": "#2A3040",
    "danger": "#FF5A5A",
    "success": "#3DD68C",
    "warning": "#FFB547",
    "info": "#3DDBFF",
}

DEFAULT_TYPOGRAPHY = {
    "vibe": ["modern", "clean"],
    "fonts": {"display": "Manrope", "body": "Inter", "mono": "JetBrains Mono"},
    "weight_profile": "balanced",
    "spacing_rhythm": "balanced",
}

DEFAULT_RADII = {
    "tight": {"sm": 2, "base": 4, "md": 6, "lg": 8, "xl": 12, "2xl": 16},
    "balanced": {"sm": 4, "base": 8, "md": 12, "lg": 16, "xl": 24, "2xl": 32},
    "airy": {"sm": 8, "base": 12, "md": 20, "lg": 28, "xl": 36, "2xl": 48},
}


# ---------- Helpers ----------

def normalize_color_key(k: str) -> str:
    """colors.json uses kebab/camel; templates use UPPER_SNAKE."""
    return k.replace("-", "_").replace(" ", "_").upper()


def load_json(path: str | None) -> dict[str, Any]:
    if not path:
        return {}
    p = Path(path)
    if not p.exists():
        sys.exit(f"ERROR: input file not found: {path}")
    return json.loads(p.read_text(encoding="utf-8"))


def merge_colors(extracted: dict, figma: dict) -> tuple[dict, dict]:
    """Returns (light, dark) palettes. Figma color styles override extracted
    where they match by name (e.g., 'primary', 'background')."""
    light = dict(DEFAULT_LIGHT_COLORS)
    dark = dict(DEFAULT_DARK_COLORS)

    # Extracted colors come keyed by mode
    if "light" in extracted:
        for k, v in extracted["light"].items():
            normalized = k.replace("-", "_")
            if normalized in light:
                light[normalized] = v
    if "dark" in extracted:
        for k, v in extracted["dark"].items():
            normalized = k.replace("-", "_")
            if normalized in dark:
                dark[normalized] = v

    # Figma color styles by name match (case-insensitive substring)
    figma_styles = figma.get("color_styles", {}) if figma else {}
    role_map = {
        "primary": "primary", "secondary": "secondary", "accent": "accent",
        "background": "background", "surface": "surface",
        "text": "text_primary", "border": "outline", "outline": "outline",
        "danger": "danger", "error": "danger", "success": "success",
        "warning": "warning", "info": "info",
    }
    for style_name, hex_value in figma_styles.items():
        lname = style_name.lower()
        for role_keyword, target_key in role_map.items():
            if role_keyword in lname:
                # Heuristic: if style name contains 'dark', apply to dark; 'light' to light; else both
                if "dark" in lname or "night" in lname:
                    dark[target_key] = hex_value
                elif "light" in lname or "day" in lname:
                    light[target_key] = hex_value
                else:
                    # Apply to whichever mode it visually fits
                    light[target_key] = hex_value
                    dark[target_key] = hex_value
                break

    return light, dark


def font_weight_for_profile(profile: str) -> dict[str, str]:
    """RN uses string weights '100'..'900' or 'normal'/'bold'."""
    profiles = {
        "light": {"regular": "300", "medium": "400", "semibold": "500", "bold": "700"},
        "balanced": {"regular": "400", "medium": "500", "semibold": "600", "bold": "700"},
        "heavy": {"regular": "500", "medium": "600", "semibold": "700", "bold": "800"},
    }
    return profiles.get(profile, profiles["balanced"])


def font_to_expo_package(font_family: str) -> str:
    """'Manrope' → '@expo-google-fonts/manrope'"""
    return f"@expo-google-fonts/{font_family.lower().replace(' ', '-')}"


# ---------- Rendering ----------

def render_templates(templates_dir: Path, out_dir: Path, subs: dict[str, str]) -> list[Path]:
    """Reads every .template file in templates_dir, substitutes, writes to out_dir."""
    written = []
    for tpl in sorted(templates_dir.glob("*.template")):
        content = tpl.read_text(encoding="utf-8")
        for key, value in subs.items():
            content = content.replace("{{" + key + "}}", str(value))
        out_name = tpl.name[:-len(".template")]
        out_path = out_dir / out_name
        out_dir.mkdir(parents=True, exist_ok=True)
        out_path.write_text(content, encoding="utf-8")
        written.append(out_path)
    return written


def write_showcase_route(project: Path) -> Path:
    """app/theme-showcase.tsx — wraps the ThemeShowcaseView from src/theme."""
    route_path = project / "app" / "theme-showcase.tsx"
    route_path.parent.mkdir(parents=True, exist_ok=True)
    route_path.write_text(
        '// Hidden dev-only route. Visit /theme-showcase to inspect every theme token.\n\n'
        'import { ThemeShowcaseView } from "@/theme/theme-showcase";\n\n'
        'export default function ThemeShowcaseRoute() {\n'
        '  return <ThemeShowcaseView />;\n'
        '}\n',
        encoding="utf-8",
    )
    return route_path


def write_report(project: Path, light: dict, dark: dict, typography: dict, figma: dict, sources: dict) -> Path:
    """theme-setup-report.md — record of decisions."""
    now = datetime.datetime.now().isoformat(timespec="seconds")
    fonts_section = "\n".join(f"- **{role}**: {family}" for role, family in typography["fonts"].items())
    light_section = "\n".join(f"- `{k}` → `{v}`" for k, v in light.items())
    dark_section = "\n".join(f"- `{k}` → `{v}`" for k, v in dark.items())
    figma_section = ""
    if figma and figma.get("file_key"):
        figma_section = f"\n**Figma**: [{figma.get('file_name', 'file')}]({figma.get('file_url', '')}) ({len(figma.get('color_styles', {}))} color styles, {len(figma.get('text_styles', {}))} text styles)\n"

    content = f"""# theme-setup report

Generated: {now}

## Inputs

{figma_section}**Vibe**: {", ".join(typography.get("vibe", []))}
**Weight profile**: {typography.get("weight_profile", "balanced")}
**Spacing rhythm**: {typography.get("spacing_rhythm", "balanced")}

## Fonts

{fonts_section}

Install these with `npm install`:
{" ".join(font_to_expo_package(f) for f in typography["fonts"].values())}

## Light palette

{light_section}

## Dark palette

{dark_section}

## Decision sources

Where each token came from (figma > brand seed > extracted > default):

{chr(10).join(f"- `{k}` ← {v}" for k, v in sources.items())}

## Next steps

1. `npm install` to install the font packages.
2. `npm run dev` and visit `/theme-showcase` to inspect every token in use.
3. Edit `src/theme/*` to fine-tune. Re-run theme-setup to regenerate.
"""
    report_path = project / "theme-setup-report.md"
    report_path.write_text(content, encoding="utf-8")
    return report_path


# ---------- Main ----------

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--project", required=True, help="Target project root")
    p.add_argument("--colors", help="colors.json from extract_colors.py")
    p.add_argument("--typography", help="typography.json from Claude analysis")
    p.add_argument("--figma", help="figma.json from fetch_figma.py")
    p.add_argument("--default-mode", choices=["light", "dark"], default="dark")
    p.add_argument("--templates", default=str(DEFAULT_TEMPLATES))
    p.add_argument("--no-backup", action="store_true")
    args = p.parse_args()

    project = Path(args.project).resolve()
    if not project.exists():
        sys.exit(f"ERROR: project not found: {project}")
    if not (project / "app").exists():
        sys.exit(f"ERROR: {project} doesn't look like an Expo Router project (no app/ dir)")

    templates_dir = Path(args.templates).resolve()
    if not templates_dir.exists():
        sys.exit(f"ERROR: templates dir not found: {templates_dir}")

    # Load inputs (all optional)
    extracted = load_json(args.colors)
    typography = load_json(args.typography) or DEFAULT_TYPOGRAPHY
    figma = load_json(args.figma)

    # Synthesize palette
    light, dark = merge_colors(extracted, figma)

    # Track sources for the report
    sources = {}
    for k in light:
        if figma and figma.get("color_styles") and any(k in s.lower().replace("-", "_") for s in figma["color_styles"]):
            sources[k] = "figma"
        elif extracted.get("light", {}).get(k.replace("_", "-")) or extracted.get("light", {}).get(k):
            sources[k] = "image extraction"
        else:
            sources[k] = "default fallback"

    # Backup existing theme
    theme_dir = project / "src" / "theme"
    if theme_dir.exists() and not args.no_backup:
        stamp = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
        backup = project / "src" / f"theme.backup-{stamp}"
        shutil.copytree(theme_dir, backup)
        print(f"Backed up existing theme to {backup}", file=sys.stderr)

    # Build substitutions
    weights = font_weight_for_profile(typography.get("weight_profile", "balanced"))
    radii = DEFAULT_RADII.get(typography.get("spacing_rhythm", "balanced"), DEFAULT_RADII["balanced"])

    subs = {
        # Light colors
        **{f"LIGHT_{normalize_color_key(k)}": v for k, v in light.items()},
        # Dark colors
        **{f"DARK_{normalize_color_key(k)}": v for k, v in dark.items()},
        # Typography
        "FONT_DISPLAY": typography["fonts"].get("display", "Manrope"),
        "FONT_BODY": typography["fonts"].get("body", "Inter"),
        "FONT_MONO": typography["fonts"].get("mono", "JetBrains Mono"),
        "FONT_WEIGHT_REGULAR": weights["regular"],
        "FONT_WEIGHT_MEDIUM": weights["medium"],
        "FONT_WEIGHT_SEMIBOLD": weights["semibold"],
        "FONT_WEIGHT_BOLD": weights["bold"],
        # Spacing
        "SPACING_RHYTHM": typography.get("spacing_rhythm", "balanced"),
        # Radii
        "RADIUS_SM": radii["sm"],
        "RADIUS_BASE": radii["base"],
        "RADIUS_MD": radii["md"],
        "RADIUS_LG": radii["lg"],
        "RADIUS_XL": radii["xl"],
        "RADIUS_2XL": radii["2xl"],
        # Shadows
        "SHADOW_COLOR": dark["text_primary"] if args.default_mode == "dark" else light["text_primary"],
        "GLOW_COLOR": (dark if args.default_mode == "dark" else light)["primary"],
        # Default theme
        "DEFAULT_THEME": "darkTheme" if args.default_mode == "dark" else "lightTheme",
    }

    # Render
    written = render_templates(templates_dir, theme_dir, subs)
    print(f"Wrote {len(written)} files to {theme_dir}", file=sys.stderr)

    showcase = write_showcase_route(project)
    print(f"Wrote showcase route to {showcase}", file=sys.stderr)

    report = write_report(project, light, dark, typography, figma, sources)
    print(f"Wrote report to {report}", file=sys.stderr)

    # Print npm install commands for the caller
    packages = sorted({font_to_expo_package(f) for f in typography["fonts"].values()})
    print(json.dumps({
        "status": "success",
        "files_written": [str(p) for p in written + [showcase, report]],
        "npm_packages": packages,
        "next_steps": [
            f"cd {project} && npm install " + " ".join(packages),
            "Update app/_layout.tsx to wrap PaperProvider with appTheme and useFonts gate (theme-setup will print the patch)",
            "Run npm run dev and visit /theme-showcase",
        ],
    }))


if __name__ == "__main__":
    main()
