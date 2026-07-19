#!/usr/bin/env python3
"""Generate a performant component (V2): inline-props by default for
feature-scoped, sibling .interface.ts for app-wide. Optional copyright
header. memo wrap by default. Static const styles."""

from __future__ import annotations
import argparse, datetime, re, sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
TEMPLATES_DIR = SCRIPT_DIR.parent / "assets" / "templates"


def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--name", required=True, help="PascalCase component name")
    p.add_argument("--location", required=True, help="Target folder (must exist)")
    p.add_argument("--description", required=True, help="One-sentence description")
    p.add_argument("--props-type", required=True,
                   help="TS type body (lines between { and }). Pass empty string for no props.")
    p.add_argument("--prop-names", required=True,
                   help="Comma-separated prop names for destructuring. Empty if no props.")
    p.add_argument("--props-style", choices=["auto", "inline", "sibling"], default="auto",
                   help="auto: inline if target is page/*/components/, sibling if src/components/")
    p.add_argument("--memo", choices=["auto", "yes", "no"], default="auto",
                   help="auto: yes for components/ folder, no for top-level wrappers")
    p.add_argument("--copyright-holder", default="",
                   help="If set, prepends a copyright header block")
    p.add_argument("--copyright-year", default="",
                   help="Year for the copyright header (default: current year)")
    return p.parse_args()


def validate(args):
    if not re.match(r"^[A-Z][A-Za-z0-9]*$", args.name):
        sys.exit(f"ERROR: invalid name {args.name!r}. Use PascalCase.")
    t = Path(args.location)
    if not t.exists() or not t.is_dir():
        sys.exit(f"ERROR: target folder does not exist: {t.resolve()}")


def to_kebab(name):
    return re.sub(r"(?<!^)(?=[A-Z])", "-", name).lower()


def resolve_props_style(args):
    if args.props_style != "auto":
        return args.props_style
    # Auto: look at the location path
    norm = args.location.replace("\\", "/")
    if "/page/" in norm and "/components" in norm:
        return "inline"   # feature-scoped: inline (99% Gather pattern)
    return "sibling"      # app-wide: sibling .interface.ts (the deliberate exception)


def resolve_memo(args):
    if args.memo != "auto":
        return args.memo == "yes"
    # Auto: yes for anything inside a components/ folder (likely list-items / reusables)
    norm = args.location.replace("\\", "/")
    return "/components" in norm


def render_header(args):
    if not args.copyright_holder:
        return ""
    year = args.copyright_year or str(datetime.date.today().year)
    return (
        "/*\n"
        f" * Copyright (c) {year}, {args.copyright_holder}\n"
        " */\n\n"
    )


def render_inline_component(args, kebab, name, memo_wrap, has_props):
    header = render_header(args)
    memo_import = '\nimport { memo } from "react";' if memo_wrap else ""
    props_type_block = (
        f"\ntype {name}Props = {{\n  {args.props_type}\n}};\n"
    ) if has_props else ""
    open_wrap = "memo(function " if memo_wrap else "function "
    close_wrap = ")" if memo_wrap else ""
    func_name = name  # always named for stack traces, even inside memo
    args_signature = (
        f"({{ {args.prop_names} }}: {name}Props)" if has_props else "()"
    )
    return f"""{header}// {name} — {args.description}
//
// Dumb component: props in, JSX out. No data fetching. No services. No
// load-bearing state. References theme tokens, never literal values.

import {{ Card, Text }} from "react-native-paper";{memo_import}

import {{ colors, spacing }} from "@/theme";
{props_type_block}
const containerStyle = {{ margin: spacing.md, padding: spacing.md }};
const titleStyle = {{ color: colors.textPrimary }};

export const {name} = {open_wrap}{func_name}{args_signature} {{
  return (
    <Card mode="contained" style={{containerStyle}}>
      <Card.Content>
        <Text variant="titleMedium" style={{titleStyle}}>
          {{/* TODO: render the props above using Paper components and theme tokens */}}
        </Text>
      </Card.Content>
    </Card>
  );
}}{close_wrap};
"""


def render_sibling_component(args, kebab, name, memo_wrap, has_props):
    header = render_header(args)
    memo_import = '\nimport { memo } from "react";' if memo_wrap else ""
    open_wrap = "memo(function " if memo_wrap else "function "
    close_wrap = ")" if memo_wrap else ""
    args_signature = (
        f"({{ {args.prop_names} }}: {name}Props)" if has_props else "()"
    )
    type_import = (
        f'\nimport type {{ {name}Props }} from "./{kebab}.interface";\n'
    ) if has_props else ""
    return f"""{header}// {name} — {args.description}
//
// Dumb component: props in, JSX out. No data fetching. No services. No
// load-bearing state. References theme tokens, never literal values.

import {{ Card, Text }} from "react-native-paper";{memo_import}

import {{ colors, spacing }} from "@/theme";
{type_import}
const containerStyle = {{ margin: spacing.md, padding: spacing.md }};
const titleStyle = {{ color: colors.textPrimary }};

export const {name} = {open_wrap}{name}{args_signature} {{
  return (
    <Card mode="contained" style={{containerStyle}}>
      <Card.Content>
        <Text variant="titleMedium" style={{titleStyle}}>
          {{/* TODO: render the props above using Paper components and theme tokens */}}
        </Text>
      </Card.Content>
    </Card>
  );
}}{close_wrap};
"""


def render_interface(args, name):
    header = render_header(args)
    return f"""{header}export type {name}Props = {{
  {args.props_type}
}};
"""


def update_index(target_dir, kebab, name, props_style, has_props):
    index = target_dir / "index.ts"
    lines = []
    if index.exists():
        lines = [l.rstrip() for l in index.read_text(encoding="utf-8").splitlines() if l.strip()]
    e1 = f'export {{ {name} }} from "./{kebab}.component";'
    if e1 not in lines:
        lines.append(e1)
    if props_style == "sibling" and has_props:
        e2 = f'export type {{ {name}Props }} from "./{kebab}.interface";'
        if e2 not in lines:
            lines.append(e2)
    lines.sort()
    index.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main():
    args = parse_args()
    validate(args)
    target = Path(args.location).resolve()
    kebab = to_kebab(args.name)
    props_style = resolve_props_style(args)
    memo_wrap = resolve_memo(args)
    has_props = bool(args.prop_names.strip())

    component_path = target / f"{kebab}.component.tsx"
    if component_path.exists():
        sys.exit(f"ERROR: {component_path} exists. Refusing to overwrite.")

    if props_style == "inline":
        content = render_inline_component(args, kebab, args.name, memo_wrap, has_props)
    else:
        content = render_sibling_component(args, kebab, args.name, memo_wrap, has_props)
        if has_props:
            iface_path = target / f"{kebab}.interface.ts"
            if iface_path.exists():
                sys.exit(f"ERROR: {iface_path} exists. Refusing to overwrite.")
            iface_path.write_text(render_interface(args, args.name), encoding="utf-8")
            print(f"Wrote {iface_path}")

    component_path.write_text(content, encoding="utf-8")
    print(f"Wrote {component_path}")
    update_index(target, kebab, args.name, props_style, has_props)
    print(f"Updated {target / 'index.ts'}")
    print()
    print(f"Style: {props_style} props, memo={'yes' if memo_wrap else 'no'}, "
          f"header={'yes' if args.copyright_holder else 'no'}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
