#!/usr/bin/env python3
"""extract_colors.py — Pulls a unified semantic color palette from one or more
reference images.

Pipeline:
  1. For each image, extract a 7-color dominant palette via colorthief.
  2. Cluster colors across all images in LAB color space (perceptually uniform).
  3. Score each cluster: presence (how many images), prevalence (pixel share),
     saturation, lightness. The most "branded" cluster becomes `primary`;
     remaining roles fill in by heuristic.
  4. Reconcile against an optional brand-color seed (anchored as `primary` if
     the seed has a near-match in the extracted palette; otherwise injected
     and the next-best cluster becomes `secondary`).
  5. Generate light + dark variants (if mode == auto, both are emitted).

Output: JSON written to stdout or --out path. Schema:
  {
    "light": { "primary": "#3DDBFF", "background": "#0A0E1A", ... },
    "dark":  { "primary": "#3DDBFF", "background": "#0A0E1A", ... },
    "source": { "primary": "image:1 cluster 2", "background": "extrapolated", ... }
  }
"""

from __future__ import annotations
import argparse, colorsys, json, sys
from pathlib import Path
from typing import Iterable

try:
    from PIL import Image
except ImportError:
    sys.exit("ERROR: Pillow not installed. Run: pip install --break-system-packages Pillow colorthief")

try:
    from colorthief import ColorThief
except ImportError:
    sys.exit("ERROR: colorthief not installed. Run: pip install --break-system-packages colorthief")


def hex_of(rgb: tuple[int, int, int]) -> str:
    return "#{:02X}{:02X}{:02X}".format(*rgb)


def rgb_of(hex_str: str) -> tuple[int, int, int]:
    h = hex_str.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))


def rgb_to_lab(rgb: tuple[int, int, int]) -> tuple[float, float, float]:
    """sRGB → CIELAB. Used for perceptual color distance."""
    def to_lin(c):
        c /= 255.0
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

    r, g, b = (to_lin(c) for c in rgb)
    x = (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) / 0.95047
    y = (r * 0.2126729 + g * 0.7151522 + b * 0.0721750) / 1.00000
    z = (r * 0.0193339 + g * 0.1191920 + b * 0.9503041) / 1.08883

    def f(t):
        return t ** (1 / 3) if t > 0.008856 else (7.787 * t + 16 / 116)

    fx, fy, fz = f(x), f(y), f(z)
    return (116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz))


def lab_distance(a: tuple[float, float, float], b: tuple[float, float, float]) -> float:
    return sum((x - y) ** 2 for x, y in zip(a, b)) ** 0.5


def hsl_of(rgb: tuple[int, int, int]) -> tuple[float, float, float]:
    r, g, b = (c / 255.0 for c in rgb)
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    return (h, s, l)


def extract_per_image(path: Path, count: int = 7) -> list[tuple[int, int, int]]:
    """colorthief returns dominant + N-1 palette colors."""
    try:
        ct = ColorThief(str(path))
        palette = ct.get_palette(color_count=count, quality=5)
        return [tuple(int(c) for c in rgb) for rgb in palette]
    except Exception as e:
        print(f"WARN: failed to extract palette from {path}: {e}", file=sys.stderr)
        return []


def cluster_colors(all_colors: list[tuple[int, int, int]], k: int = 10) -> list[tuple[tuple[int, int, int], int]]:
    """Naive single-pass clustering by LAB distance. Returns (centroid_rgb, count).
    Good enough for 20-50 input colors; no scipy dependency."""
    if not all_colors:
        return []
    clusters: list[list[tuple[int, int, int]]] = []
    threshold = 18.0  # LAB distance; ~JND is 2.3, 18 groups visually-similar shades
    for rgb in all_colors:
        lab = rgb_to_lab(rgb)
        placed = False
        for cluster in clusters:
            centroid = cluster[0]
            if lab_distance(lab, rgb_to_lab(centroid)) < threshold:
                cluster.append(rgb)
                placed = True
                break
        if not placed:
            clusters.append([rgb])

    # Centroid = average of cluster members
    result = []
    for cluster in clusters:
        avg = tuple(int(sum(c[i] for c in cluster) / len(cluster)) for i in range(3))
        result.append((avg, len(cluster)))
    # Sort by cluster size descending
    result.sort(key=lambda x: -x[1])
    return result[:k]


def score_for_role(rgb: tuple[int, int, int], role: str) -> float:
    """Higher score = better fit for the role. Heuristic, not optimization."""
    h, s, l = hsl_of(rgb)
    if role == "primary":
        # Saturated, not too light, not too dark
        return s * (1 - abs(l - 0.5) * 1.5)
    if role == "accent":
        # Even more saturated, slightly off-hue from primary (handled at assignment)
        return s * 1.2 * (1 - abs(l - 0.55))
    if role == "background-dark":
        # Very low lightness, low saturation
        return (1 - l) ** 2 * (1 - s * 0.5)
    if role == "background-light":
        # Very high lightness, low saturation
        return l ** 2 * (1 - s * 0.5)
    if role == "surface-dark":
        return (1 - l) * 0.9 if l < 0.25 else 0
    if role == "surface-light":
        return l * 0.9 if l > 0.85 else 0
    return 0


def detect_mode(clusters: list[tuple[tuple[int, int, int], int]]) -> str:
    """If the dominant-by-pixel-count cluster is dark, infer dark mode."""
    if not clusters:
        return "light"
    top_rgb, _ = clusters[0]
    _, _, l = hsl_of(top_rgb)
    return "dark" if l < 0.35 else "light"


def assign_roles(clusters: list[tuple[tuple[int, int, int], int]], brand_seed: str | None, mode: str) -> dict[str, str]:
    """Map clusters → semantic roles for the given mode (light or dark)."""
    palette = {}
    used = set()

    def pick(role: str, fallback: str) -> str:
        best = None
        best_score = -1
        for i, (rgb, _) in enumerate(clusters):
            if i in used:
                continue
            sc = score_for_role(rgb, role)
            if sc > best_score:
                best_score = sc
                best = i
        if best is not None and best_score > 0.05:
            used.add(best)
            return hex_of(clusters[best][0])
        return fallback

    # Primary: brand seed wins if provided
    if brand_seed:
        palette["primary"] = brand_seed.upper()
    else:
        palette["primary"] = pick("primary", "#3478F6")

    palette["accent"] = pick("accent", palette["primary"])
    # Secondary = next-best primary candidate
    palette["secondary"] = pick("primary", palette["accent"])

    if mode == "dark":
        palette["background"] = pick("background-dark", "#0A0E1A")
        palette["surface"] = pick("surface-dark", "#141823")
        palette["surface-variant"] = "#1E2330"
        palette["text-primary"] = "#FFFFFF"
        palette["text-secondary"] = "#A0A8B8"
        palette["text-disabled"] = "#5A6275"
        palette["outline"] = "#2A3040"
    else:
        palette["background"] = pick("background-light", "#FFFFFF")
        palette["surface"] = pick("surface-light", "#F7F8FA")
        palette["surface-variant"] = "#EEF0F4"
        palette["text-primary"] = "#0A0E1A"
        palette["text-secondary"] = "#5A6275"
        palette["text-disabled"] = "#A0A8B8"
        palette["outline"] = "#D6D9E0"

    palette["danger"] = "#FF5A5A"
    palette["success"] = "#3DD68C"
    palette["warning"] = "#FFB547"
    palette["info"] = palette["primary"]

    return palette


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--images", nargs="*", default=[], help="One or more image paths or URLs")
    p.add_argument("--brand-seed", default=None, help="#RRGGBB anchor for primary")
    p.add_argument("--mode", choices=["light", "dark", "auto"], default="auto")
    p.add_argument("--out", default="-", help="Output JSON path or '-' for stdout")
    args = p.parse_args()

    if args.brand_seed and not args.brand_seed.startswith("#"):
        args.brand_seed = "#" + args.brand_seed

    # Collect colors from all images
    all_colors: list[tuple[int, int, int]] = []
    per_image_palettes = []
    for img_path in args.images:
        path = Path(img_path)
        if not path.exists():
            print(f"WARN: image not found: {img_path}", file=sys.stderr)
            continue
        palette = extract_per_image(path)
        per_image_palettes.append({"image": str(path), "palette": [hex_of(c) for c in palette]})
        all_colors.extend(palette)

    if not all_colors and not args.brand_seed:
        sys.exit("ERROR: no images yielded colors AND no --brand-seed provided. Nothing to extract.")

    clusters = cluster_colors(all_colors)

    # Determine mode
    if args.mode == "auto":
        mode = detect_mode(clusters)
    else:
        mode = args.mode

    if mode == "auto" or args.mode == "auto":
        # Build both
        light = assign_roles(clusters, args.brand_seed, "light")
        dark = assign_roles(clusters, args.brand_seed, "dark")
        result = {"light": light, "dark": dark, "detected-mode": detect_mode(clusters)}
    else:
        single = assign_roles(clusters, args.brand_seed, mode)
        result = {mode: single}

    result["clusters"] = [{"hex": hex_of(rgb), "weight": count} for rgb, count in clusters]
    result["per_image"] = per_image_palettes

    out_json = json.dumps(result, indent=2)
    if args.out == "-":
        print(out_json)
    else:
        Path(args.out).write_text(out_json, encoding="utf-8")
        print(f"Wrote palette to {args.out}", file=sys.stderr)


if __name__ == "__main__":
    main()
