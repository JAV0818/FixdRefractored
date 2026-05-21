#!/usr/bin/env python3
"""fetch_figma.py — Pulls design tokens from a Figma file.

Hits these Figma REST endpoints:
  GET /v1/files/:key         → document tree + styles registry
  GET /v1/files/:key/nodes   → fully-resolved nodes for style IDs
  GET /v1/images/:key        → rendered PNG thumbnails for frames

Outputs JSON with:
  - color_styles: {style_name: "#RRGGBB"}
  - text_styles: {style_name: {fontFamily, fontWeight, fontSize, lineHeight}}
  - effect_styles: {style_name: {type, offset, blur, color}}
  - frame_thumbnails: {frame_name: png_url}
  - file_name, file_url

Auth: requires a Figma personal access token via --token or FIGMA_TOKEN env.
Generate one at https://www.figma.com/developers/api#access-tokens.
"""

from __future__ import annotations
import argparse, json, os, re, sys, urllib.parse, urllib.request
from pathlib import Path


FIGMA_API = "https://api.figma.com/v1"


def parse_figma_url(url: str) -> tuple[str, str | None]:
    """Extract file_key and optional node_id from a Figma URL.
    Examples:
      https://www.figma.com/file/ABC123/MyFile           → ("ABC123", None)
      https://www.figma.com/design/ABC123/MyFile         → ("ABC123", None)
      https://www.figma.com/file/ABC123/MyFile?node-id=12%3A34 → ("ABC123", "12:34")
    """
    m = re.search(r"figma\.com/(?:file|design)/([A-Za-z0-9]+)", url)
    if not m:
        sys.exit(f"ERROR: could not parse Figma file key from URL: {url}")
    file_key = m.group(1)

    node_id = None
    parsed = urllib.parse.urlparse(url)
    qs = urllib.parse.parse_qs(parsed.query)
    if "node-id" in qs:
        node_id = urllib.parse.unquote(qs["node-id"][0])
    return file_key, node_id


def api_get(path: str, token: str) -> dict:
    req = urllib.request.Request(
        f"{FIGMA_API}{path}",
        headers={"X-Figma-Token": token, "User-Agent": "theme-setup/1.0"},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        if e.code == 403:
            sys.exit("ERROR: Figma API returned 403. Check your token has read access to this file.")
        if e.code == 404:
            sys.exit("ERROR: Figma file not found (404). Check the URL.")
        if e.code == 429:
            sys.exit("ERROR: Figma API rate limit hit. Wait a minute and retry.")
        body = e.read().decode("utf-8", errors="ignore")
        sys.exit(f"ERROR: Figma API {e.code}: {body[:200]}")
    except Exception as e:
        sys.exit(f"ERROR: Figma API request failed: {e}")


def rgba_to_hex(r: float, g: float, b: float, a: float = 1.0) -> str:
    """Figma colors are 0-1 floats."""
    return "#{:02X}{:02X}{:02X}".format(
        int(round(r * 255)), int(round(g * 255)), int(round(b * 255))
    )


def find_node(tree: dict, node_id: str) -> dict | None:
    """Depth-first search for a node by id."""
    if tree.get("id") == node_id:
        return tree
    for child in tree.get("children", []) or []:
        found = find_node(child, node_id)
        if found:
            return found
    return None


def collect_styled_nodes(tree: dict, styles: dict) -> tuple[dict, dict, dict]:
    """Walk the document tree and collect nodes by their styles[*] reference.
    Figma's file response gives us:
      - styles: { style_id: { key, name, styleType, description } }
      - tree.styles per node: { fill: style_id, text: style_id, effect: style_id }
    But the actual fill/textStyle values live INSIDE each node. So we walk the
    tree, find nodes referencing each style id, and pull values from them."""

    color_styles: dict[str, str] = {}
    text_styles: dict[str, dict] = {}
    effect_styles: dict[str, dict] = {}

    def visit(node: dict):
        node_styles = node.get("styles", {}) or {}

        # Fill / color styles
        for style_key in ("fill", "fills"):
            if style_key in node_styles:
                style_id = node_styles[style_key]
                style_meta = styles.get(style_id, {})
                style_name = style_meta.get("name", style_id)
                if style_name not in color_styles:
                    fills = node.get("fills") or []
                    for fill in fills:
                        if fill.get("type") == "SOLID" and "color" in fill:
                            c = fill["color"]
                            color_styles[style_name] = rgba_to_hex(
                                c["r"], c["g"], c["b"], c.get("a", 1.0)
                            )
                            break

        # Text styles
        if "text" in node_styles:
            style_id = node_styles["text"]
            style_meta = styles.get(style_id, {})
            style_name = style_meta.get("name", style_id)
            if style_name not in text_styles:
                style_obj = node.get("style") or {}
                text_styles[style_name] = {
                    "fontFamily": style_obj.get("fontFamily"),
                    "fontWeight": style_obj.get("fontWeight"),
                    "fontSize": style_obj.get("fontSize"),
                    "lineHeight": style_obj.get("lineHeightPx") or style_obj.get("lineHeightPercent"),
                    "letterSpacing": style_obj.get("letterSpacing"),
                }

        # Effect styles
        if "effect" in node_styles:
            style_id = node_styles["effect"]
            style_meta = styles.get(style_id, {})
            style_name = style_meta.get("name", style_id)
            if style_name not in effect_styles:
                effects = node.get("effects") or []
                if effects:
                    eff = effects[0]
                    effect_styles[style_name] = {
                        "type": eff.get("type"),
                        "offset": eff.get("offset"),
                        "radius": eff.get("radius"),
                        "color": rgba_to_hex(
                            eff["color"]["r"], eff["color"]["g"],
                            eff["color"]["b"], eff["color"].get("a", 1.0),
                        ) if eff.get("color") else None,
                    }

        for child in node.get("children", []) or []:
            visit(child)

    visit(tree)
    return color_styles, text_styles, effect_styles


def collect_frames(tree: dict, limit: int = 12) -> list[dict]:
    """Find top-level FRAME nodes to render as thumbnails."""
    frames = []

    def visit(node: dict, depth: int = 0):
        if len(frames) >= limit:
            return
        if node.get("type") == "FRAME" and depth <= 2:
            frames.append({"id": node["id"], "name": node.get("name", "Untitled")})
        for child in node.get("children", []) or []:
            visit(child, depth + 1)

    visit(tree)
    return frames


def fetch_thumbnails(file_key: str, frame_ids: list[str], token: str) -> dict[str, str]:
    """Render thumbnails for a list of frame ids."""
    if not frame_ids:
        return {}
    ids_param = ",".join(frame_ids)
    resp = api_get(
        f"/images/{file_key}?ids={urllib.parse.quote(ids_param)}&format=png&scale=2",
        token,
    )
    return resp.get("images", {})


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--url", required=True, help="Figma file/page/frame URL")
    p.add_argument("--token", default=os.environ.get("FIGMA_TOKEN"), help="Figma PAT")
    p.add_argument("--out", default="-", help="Output JSON path or '-' for stdout")
    p.add_argument("--thumbnails", action="store_true", help="Also fetch frame thumbnails")
    args = p.parse_args()

    if not args.token:
        sys.exit("ERROR: no Figma token. Pass --token or set FIGMA_TOKEN env var.")

    file_key, node_id = parse_figma_url(args.url)
    print(f"Fetching Figma file {file_key}...", file=sys.stderr)

    file_data = api_get(f"/files/{file_key}", args.token)
    document = file_data.get("document", {})
    styles_registry = file_data.get("styles", {}) or {}

    # If a specific node was referenced, narrow to that subtree
    if node_id:
        subtree = find_node(document, node_id)
        if subtree:
            document = subtree
        else:
            print(f"WARN: node {node_id} not found, using full document", file=sys.stderr)

    color_styles, text_styles, effect_styles = collect_styled_nodes(document, styles_registry)

    frames = collect_frames(document) if args.thumbnails else []
    thumbnail_urls = {}
    if frames:
        thumbnail_urls = fetch_thumbnails(file_key, [f["id"] for f in frames], args.token)

    result = {
        "file_key": file_key,
        "file_name": file_data.get("name", "Untitled"),
        "file_url": args.url,
        "color_styles": color_styles,
        "text_styles": text_styles,
        "effect_styles": effect_styles,
        "frames": [
            {
                "id": f["id"],
                "name": f["name"],
                "thumbnail_url": thumbnail_urls.get(f["id"]),
            }
            for f in frames
        ],
    }

    out_json = json.dumps(result, indent=2)
    if args.out == "-":
        print(out_json)
    else:
        Path(args.out).write_text(out_json, encoding="utf-8")
        print(f"Wrote Figma data to {args.out}", file=sys.stderr)


if __name__ == "__main__":
    main()
