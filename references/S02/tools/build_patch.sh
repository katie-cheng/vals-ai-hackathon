#!/bin/bash
# Rebuild references/S02/reference.patch (inputs/live-app -> solution, git binary patch) and check it reproduces solution/.
set -euo pipefail
S02="$(cd "$(dirname "$0")/.." && pwd)"; W="$(mktemp -d)"; X=(--exclude=node_modules --exclude=dist --exclude=tsconfig.tsbuildinfo)
rsync -a "${X[@]}" "$S02/inputs/live-app/" "$W/a/"; rsync -a "${X[@]}" "$S02/solution/" "$W/b/"
cp -r "$W/a" "$W/r"; cd "$W/r"; git init -q; git add -A; git -c user.name=x -c user.email=x@x commit -qm original
find . -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +; cp -r "$W/b/." .; git add -A
git diff --cached --binary > "$S02/reference.patch"
cp -r "$W/a" "$W/chk"; cd "$W/chk"; git init -q; git apply --binary "$S02/reference.patch"; rm -rf .git
diff -r . "$W/b" && echo "reference.patch reproduces solution/"
