#!/usr/bin/env python3
"""scaffold.py (V2) — Scaffolds a new Expo / React Native project with the
feature-scoped 3-tier architecture for The Cooked Dev Course."""

from __future__ import annotations
import argparse, datetime, re, shutil, subprocess, sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
TEMPLATES_DIR = SCRIPT_DIR.parent / "assets" / "templates"

SDK_VERSIONS = {
    51: {"expo": "~51.0.0", "expo_constants": "~16.0.0", "expo_linking": "~6.3.0",
         "expo_router": "~3.5.0", "expo_status_bar": "~1.12.0", "expo_system_ui": "~3.0.0",
         "react": "18.2.0", "react_dom": "18.2.0", "react_native": "0.74.0",
         "react_native_web": "~0.19.10", "react_native_safe_area_context": "4.10.0",
         "react_native_screens": "3.31.0", "types_react": "~18.2.79", "async_storage": "1.23.1" },
    52: {"expo": "~52.0.0", "expo_constants": "~17.0.0", "expo_linking": "~7.0.0",
         "expo_router": "~4.0.0", "expo_status_bar": "~2.0.0", "expo_system_ui": "~4.0.0",
         "react": "18.3.1", "react_dom": "18.3.1", "react_native": "0.76.0",
         "react_native_web": "~0.19.13", "react_native_safe_area_context": "4.12.0",
         "react_native_screens": "~4.4.0", "types_react": "~18.3.12", "async_storage": "1.23.1" },
    53: {"expo": "~53.0.0", "expo_constants": "~17.1.0", "expo_linking": "~7.1.0",
         "expo_router": "~5.0.0", "expo_status_bar": "~2.2.0", "expo_system_ui": "~5.0.0",
         "react": "19.0.0", "react_dom": "19.0.0", "react_native": "0.79.0",
         "react_native_web": "~0.20.0", "react_native_safe_area_context": "5.4.0",
         "react_native_screens": "~4.10.0", "types_react": "~19.0.0", "async_storage": "2.1.2" },
    54: {"expo": "~54.0.0", "expo_constants": "~18.0.0", "expo_linking": "~8.0.0",
         "expo_router": "~6.0.0", "expo_status_bar": "~3.0.0", "expo_system_ui": "~6.0.0",
         "react": "19.1.0", "react_dom": "19.1.0", "react_native": "0.81.0",
         "react_native_web": "~0.21.0", "react_native_safe_area_context": "5.6.0",
         "react_native_screens": "~4.16.0", "types_react": "~19.1.0", "async_storage": "2.1.2" },
}


def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--name", required=True)
    p.add_argument("--display", required=True)
    p.add_argument("--bundle", required=True)
    p.add_argument("--location", required=True)
    p.add_argument("--sdk", type=int, choices=[51, 52, 53, 54], default=54)
    p.add_argument("--brand-color", default="#3478F6")
    p.add_argument("--figma-url", default="")
    return p.parse_args()


def validate(args):
    if not re.match(r"^[A-Za-z][A-Za-z0-9-]*$", args.name):
        sys.exit(f"ERROR: invalid name {args.name!r}. Use PascalCase or kebab-case.")
    if not re.match(r"^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$", args.bundle):
        sys.exit(f"ERROR: invalid bundle id {args.bundle!r}. Use reverse-DNS lowercase.")
    if not re.match(r"^#[0-9A-Fa-f]{6}$", args.brand_color):
        sys.exit(f"ERROR: invalid brand color {args.brand_color!r}. Use #RRGGBB hex.")


def to_kebab(name):
    if "-" in name:
        return name.lower()
    return re.sub(r"(?<!^)(?=[A-Z])", "-", name).lower()


def build_substitutions(args):
    slug = to_kebab(args.name)
    name_lower = slug.replace("-", "")
    versions = SDK_VERSIONS[args.sdk]
    figma_section = ""
    if args.figma_url:
        figma_section = "\n## Design references\n\n- Figma: " + args.figma_url + "\n"
    subs = {
        "{{PROJECT_NAME}}": args.name,
        "{{PROJECT_SLUG}}": slug,
        "{{PROJECT_NAME_LOWER}}": name_lower,
        "{{DISPLAY_NAME}}": args.display,
        "{{BUNDLE_ID}}": args.bundle,
        "{{YEAR}}": str(datetime.date.today().year),
        "{{EXPO_SDK}}": str(args.sdk),
        "{{BRAND_COLOR}}": args.brand_color,
        "{{FIGMA_SECTION}}": figma_section,
    }
    for k, v in versions.items():
        subs["{{V_" + k.upper() + "}}"] = v
    return subs


def render_tree(src, dst, subs):
    if not src.exists():
        sys.exit(f"ERROR: templates dir not found at {src}")
    files = []
    for sp in sorted(src.rglob("*")):
        if sp.is_dir():
            continue
        rel = sp.relative_to(src).as_posix()
        out_rel = rel[:-len(".template")] if rel.endswith(".template") else rel
        dp = dst / out_rel
        dp.parent.mkdir(parents=True, exist_ok=True)
        content = sp.read_text(encoding="utf-8")
        if rel.endswith(".template") or "{{" in content:
            for k, v in subs.items():
                content = content.replace(k, v)
        dp.write_text(content, encoding="utf-8")
        files.append(dp)
    return files


def init_git(target):
    try:
        r = subprocess.run(["git", "init", "-q", "--initial-branch=main"],
                           cwd=target, capture_output=True, text=True)
        if r.returncode != 0:
            subprocess.run(["git", "init", "-q"], cwd=target, check=True, capture_output=True)
            subprocess.run(["git", "symbolic-ref", "HEAD", "refs/heads/main"],
                           cwd=target, check=True, capture_output=True)
        cfg = target / ".git" / "config"
        if cfg.exists():
            try:
                c = cfg.read_text(encoding="utf-8")
                if not c.startswith("[core]"):
                    cfg.write_text("[core]\n\trepositoryformatversion = 0\n\tfilemode = false\n\tbare = false\n\tlogallrefupdates = true\n", encoding="utf-8")
            except OSError:
                pass
        subprocess.run(["git", "-c", "user.email=scaffold@example.local", "-c", "user.name=scaffold", "add", "."],
                       cwd=target, check=True, capture_output=True)
        subprocess.run(["git", "-c", "user.email=scaffold@example.local", "-c", "user.name=scaffold",
                        "commit", "-q", "-m", "Initial scaffold from scaffold-rn-project skill"],
                       cwd=target, check=True, capture_output=True)
        print("Initialized git repository with first commit on main.")
    except subprocess.CalledProcessError as e:
        msg = e.stderr.decode("utf-8", errors="ignore") if isinstance(e.stderr, bytes) else (e.stderr or "")
        print(f"(git init failed: {msg.strip() or e}; files are in place)")


def main():
    args = parse_args()
    validate(args)
    target = Path(args.location).resolve()
    if target.exists() and any(target.iterdir()):
        print(f"ERROR: target dir exists and is not empty: {target}", file=sys.stderr)
        return 1
    target.mkdir(parents=True, exist_ok=True)
    subs = build_substitutions(args)
    files = render_tree(TEMPLATES_DIR, target, subs)
    print(f"Wrote {len(files)} files to {target}")
    if shutil.which("git"):
        init_git(target)
    else:
        print("(git not on PATH)")
    print()
    print("Next steps:")
    print(f"  cd {target}")
    print("  npm install")
    print("  cp .env.example .env   # then fill in your Firebase config")
    print("  npm run dev")
    return 0


if __name__ == "__main__":
    sys.exit(main())
