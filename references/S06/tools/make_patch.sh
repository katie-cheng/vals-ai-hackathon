#!/bin/bash
# Regenerates reference.patch (inputs/live-app -> solution, binary) and checks that it applies cleanly and reproduces solution/.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
EX=(--exclude=node_modules --exclude=dist --exclude='*.tsbuildinfo')
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir "$TMP/repo" "$TMP/check"
rsync -a "${EX[@]}" "$ROOT/inputs/live-app/" "$TMP/repo/"
cd "$TMP/repo"
git init -q && git add -A && git -c user.name=ref -c user.email=ref@example.com commit -qm base
find . -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
rsync -a "${EX[@]}" "$ROOT/solution/" .
git add -A && git diff --cached --binary HEAD > "$ROOT/reference.patch"
rsync -a "${EX[@]}" "$ROOT/inputs/live-app/" "$TMP/check/"
cd "$TMP/check" && git apply --binary "$ROOT/reference.patch"
diff -r -x node_modules -x dist -x '*.tsbuildinfo' "$TMP/check" "$ROOT/solution" && echo "reference.patch applies cleanly and reproduces solution/"
