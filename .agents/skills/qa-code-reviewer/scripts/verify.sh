#!/usr/bin/env bash
# Fixd QA deterministic gate. Run from anywhere — anchors at repo root.
# Exit 0 = PASS, 1 = FAIL. Warnings never fail the run.

cd "$(dirname "$0")/../../../.." || exit 1

FAILED=0

section() { printf '\n== %s ==\n' "$1"; }

section "type-check"
if ! npm run type-check --silent; then
  FAILED=1
fi

section "hardcoded hex colors outside src/theme (FAIL)"
HEX=$(grep -rnE '#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?\b' src --include='*.ts' --include='*.tsx' | grep -v 'src/theme/' | grep -v 'src/theme.backup' || true)
if [ -n "$HEX" ]; then
  echo "$HEX"
  FAILED=1
else
  echo "clean"
fi

section "firebase/* imports outside src/services (FAIL)"
# Known architectural seams: providers subscribe to auth state directly,
# and type-only imports carry no runtime dependency.
FB=$(grep -rnE "from ['\"]firebase" src --include='*.ts' --include='*.tsx' | grep -v 'src/services/' | grep -v 'src/providers/' | grep -v 'import type' || true)
if [ -n "$FB" ]; then
  echo "$FB"
  FAILED=1
else
  echo "clean"
fi

section "cometchat imports outside comet-chat-service (FAIL)"
CC=$(grep -rniE "from ['\"]@?cometchat" src --include='*.ts' --include='*.tsx' | grep -v 'src/services/comet-chat-service' || true)
if [ -n "$CC" ]; then
  echo "$CC"
  FAILED=1
else
  echo "clean"
fi

section "component files missing memo (warning only)"
find src -name '*.component.tsx' | while read -r f; do
  if ! grep -q 'memo(' "$f"; then
    echo "warn: $f — no memo( (ok only if page-level wrapper or always-new props)"
  fi
done

section "inline style objects in JSX (warning only)"
grep -rn 'style={{' src --include='*.tsx' || echo "clean"

echo
if [ "$FAILED" -eq 1 ]; then
  echo "VERIFY: FAIL"
  exit 1
fi
echo "VERIFY: PASS"
