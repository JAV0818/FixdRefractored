#!/usr/bin/env python3
"""Generate a Firestore-backed data-layer slice: service + read hooks + interface + optional mutation."""

from __future__ import annotations
import argparse, re, sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
TEMPLATES_DIR = SCRIPT_DIR.parent / "assets" / "templates"


def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--resource-plural", required=True, help="kebab-case, e.g. habits")
    p.add_argument("--resource-singular", required=True, help="PascalCase, e.g. Habit")
    p.add_argument("--feature-folder", required=True, help="e.g. src/page/habits")
    p.add_argument("--fields", required=True, help="TS type body for the resource")
    p.add_argument("--mutation", choices=["yes", "no"], default="yes")
    return p.parse_args()


def validate(args):
    if not re.match(r"^[a-z][a-z0-9-]*$", args.resource_plural):
        sys.exit(f"ERROR: invalid plural resource name {args.resource_plural!r}. Use kebab-case.")
    if not re.match(r"^[A-Z][A-Za-z0-9]*$", args.resource_singular):
        sys.exit(f"ERROR: invalid singular resource name {args.resource_singular!r}. Use PascalCase.")
    if not Path(args.feature_folder).exists():
        sys.exit(f"ERROR: feature folder does not exist: {args.feature_folder}")


def render_template(name, subs):
    content = (TEMPLATES_DIR / name).read_text(encoding="utf-8")
    for k, v in subs.items():
        content = content.replace(k, v)
    return content


def write_file(path: Path, content: str):
    if path.exists():
        sys.exit(f"ERROR: {path} already exists. Refusing to overwrite.")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    print(f"Wrote {path}")


def main():
    args = parse_args()
    validate(args)

    plural = args.resource_plural          # habits
    singular = args.resource_singular      # Habit
    singular_kebab = re.sub(r"(?<!^)(?=[A-Z])", "-", singular).lower()  # habit
    singular_lower = singular.lower()       # habit
    plural_lower = plural.replace("-", "")  # habits (collapsed)

    subs = {
        "{{RESOURCE_PLURAL}}": plural,                # "habits"
        "{{RESOURCE_PLURAL_LOWER}}": plural_lower,    # "habits"
        "{{RESOURCE_SINGULAR}}": singular,            # "Habit"
        "{{RESOURCE_SINGULAR_KEBAB}}": singular_kebab,  # "habit"
        "{{RESOURCE_SINGULAR_LOWER}}": singular_lower,  # "habit"
        "{{FIELDS}}": args.fields,
    }

    feature = Path(args.feature_folder).resolve()
    services = feature.parents[1] / "services"  # src/services from src/page/habits

    write_file(services / f"{plural}-service.ts",
               render_template("service.ts.template", subs))
    write_file(feature / "hooks" / f"use-{plural}.ts",
               render_template("use-resources.ts.template", subs))
    write_file(feature / "hooks" / f"use-{singular_kebab}.ts",
               render_template("use-resource.ts.template", subs))
    write_file(feature / "interfaces" / f"{singular_kebab}.interface.ts",
               render_template("interface.ts.template", subs))

    if args.mutation == "yes":
        write_file(feature / "hooks" / f"use-create-{singular_kebab}.ts",
                   render_template("use-create.ts.template", subs))

    print()
    print("Done. Next: consume from a view using the standard React Query shape.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
