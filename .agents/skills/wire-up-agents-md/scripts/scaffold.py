#!/usr/bin/env python3
"""wire-up-agents-md — Adds AGENTS.md + best_practices.md + guidelines/ +
.agents/skills/ infrastructure to an existing repo. Refuses to overwrite
existing files unless --force yes is passed."""

from __future__ import annotations
import argparse, sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
TEMPLATES_DIR = SCRIPT_DIR.parent / "assets" / "templates"


def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--repo", required=True, help="Path to the existing repo root")
    p.add_argument("--project-name", required=True, help="Project display name for headings")
    p.add_argument("--stack", choices=["react-native", "next-js", "generic"], default="react-native")
    p.add_argument("--force", choices=["yes", "no"], default="no",
                   help="Set to yes to overwrite existing files")
    return p.parse_args()


def validate(args):
    repo = Path(args.repo).resolve()
    if not repo.exists() or not repo.is_dir():
        sys.exit(f"ERROR: repo path does not exist or is not a directory: {repo}")
    return repo


def collect_template_files():
    """Walk the templates dir and return [(src, rel_out_path), ...]."""
    out = []
    for src in sorted(TEMPLATES_DIR.rglob("*")):
        if src.is_dir():
            continue
        rel = src.relative_to(TEMPLATES_DIR).as_posix()
        # Strip .template suffix
        out_rel = rel[:-len(".template")] if rel.endswith(".template") else rel
        out.append((src, out_rel))
    return out


def preflight_conflicts(repo, files):
    """Return a list of existing-file paths that would be overwritten."""
    conflicts = []
    for _, out_rel in files:
        dst = repo / out_rel
        if dst.exists():
            conflicts.append(out_rel)
    return conflicts


def main():
    args = parse_args()
    repo = validate(args)
    files = collect_template_files()

    conflicts = preflight_conflicts(repo, files)
    if conflicts and args.force != "yes":
        print("ERROR: target repo already contains files this skill would generate:", file=sys.stderr)
        for c in conflicts:
            print(f"  {c}", file=sys.stderr)
        print("", file=sys.stderr)
        print("Rerun with --force yes to overwrite, or edit the existing files manually.", file=sys.stderr)
        return 1

    subs = {
        "{{PROJECT_NAME}}": args.project_name,
        "{{STACK}}": args.stack,
    }

    written = []
    for src, out_rel in files:
        content = src.read_text(encoding="utf-8")
        if "{{" in content:
            for k, v in subs.items():
                content = content.replace(k, v)
        dst = repo / out_rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        dst.write_text(content, encoding="utf-8")
        written.append(dst)

    print(f"Wrote {len(written)} files to {repo}")
    for w in written:
        print(f"  {w.relative_to(repo)}")
    print()
    print("Next steps:")
    print(f"  cd {repo}")
    print("  cat AGENTS.md     # skim the index")
    print("  ls guidelines/    # see all 9 rule files")
    print("  # Edit best_practices.md to add project-specific stack details.")
    print("  # Edit guidelines/*.md to match your actual conventions.")
    if args.stack != "react-native":
        print("  # Stack is not react-native — edit guidelines/navigation.md to match")
        print("  # your routing system (Next.js App Router, React Router, etc.).")
    print()
    print('  git add AGENTS.md best_practices.md guidelines .agents')
    print('  git commit -m "chore: wire up agent context (AGENTS.md + guidelines)"')
    return 0


if __name__ == "__main__":
    sys.exit(main())
