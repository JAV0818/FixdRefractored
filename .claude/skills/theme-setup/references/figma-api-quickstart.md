# Figma REST API quickstart

What theme-setup hits, in what order, and how to debug when it fails.

## Authentication

Figma uses a personal access token (PAT). Generate one at:
https://www.figma.com/developers/api#access-tokens

Required scopes: `file_read`. (Styles + node reading both fall under this.)

Pass the token as the `X-Figma-Token` header on every request. theme-setup
stores the token in the project's `.env` as `FIGMA_TOKEN=<pat>` on first use,
then reads it from there on subsequent runs.

`.env` should be in `.gitignore` already. Double-check before committing.

## Endpoints we hit

### `GET /v1/files/:file_key`

Returns the full document tree + the `styles` registry (color styles, text
styles, effect styles by ID).

The response is large for big files — can be 5-20MB for a real product file.
We don't filter; we walk the whole tree client-side.

Response shape (heavily abbreviated):
```json
{
  "name": "My File",
  "document": {
    "id": "0:1",
    "type": "DOCUMENT",
    "children": [
      {
        "id": "0:2",
        "type": "CANVAS",
        "name": "Page 1",
        "children": [/* frames */]
      }
    ]
  },
  "styles": {
    "S:abc123": {
      "key": "abc123",
      "name": "Primary / Accent",
      "styleType": "FILL",
      "description": ""
    }
  }
}
```

### `GET /v1/files/:file_key/nodes?ids=:id1,:id2`

Returns full data for specific nodes (useful when we only care about a single
frame). We only use this if the user passes a node-specific URL.

### `GET /v1/images/:file_key?ids=:id1,:id2&format=png&scale=2`

Renders frames as PNG URLs. Used for thumbnails — we don't analyze these
images (Claude already has the user's reference images), but they go into the
theme-setup-report.md as visual proof of what was synced.

Response:
```json
{
  "err": null,
  "images": {
    "0:42": "https://figma-alpha-api.s3.us-west-2.amazonaws.com/..."
  }
}
```

The image URLs are time-limited (~12 hours).

## How styles get extracted

The challenge: Figma's styles registry only gives us metadata (name, ID, type).
The actual color/font values live INSIDE the nodes that USE the style.

So the algorithm is:
1. Walk every node in the document tree.
2. For each node, check its `styles` field (e.g., `{"fill": "S:abc"}`).
3. If a style ID matches one in the registry, pull the matching value from the
   node's `fills[]`, `style{}`, or `effects[]` field.
4. Store the value keyed by the style's NAME (not its ID — names are stable
   across file edits, IDs aren't).

This means we need at least ONE node in the document that USES each style, or
we won't see the value. In practice, designers always apply their styles to at
least one element. If a style is defined but unused, we skip it.

## Common errors

### 403 Forbidden

The token doesn't have access to the file. Either:
- The token is wrong (regenerate it)
- The file belongs to a team / org the token's owner isn't on
- The file is private and the token's user wasn't shared on it

Fix: share the file with the token's user, or use a token from a user who has access.

### 404 Not Found

The file key is wrong. theme-setup parses the file key from the URL — double-
check the URL is a real Figma file URL, not a community link or org page.

### 429 Too Many Requests

Rate limit. Figma's per-token limit is generous but not infinite. theme-setup
retries with backoff up to 3 times. If it still fails, wait a minute.

### Empty `color_styles` / `text_styles`

The file doesn't have published styles — the designer styled elements directly
with raw colors instead of style references. In this case, theme-setup falls
back to the image-extraction path (Claude analyzes the rendered frames).

## Debugging

If a token isn't being picked up:
1. Inspect `figma.json` (theme-setup writes it during the run, can pass `--keep-temp` to preserve it).
2. Search for the style name you expected. Did it show up under `color_styles`?
3. If not, the style wasn't applied to any node — check the Figma file.
