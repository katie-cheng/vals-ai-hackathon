#!/bin/bash
# Vendor the current tbi source into pkg/ so the agent directory is self-contained, then push:
#   bash agents/tbi-contestant/build.sh && valkyrie agent push agents/tbi-contestant
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
root="$(cd "$here/../.." && pwd)"
rm -rf "$here/pkg" && mkdir -p "$here/pkg"
cp -r "$root/tbi" "$root/pyproject.toml" "$root/README.md" "$here/pkg/"
find "$here/pkg" -name __pycache__ -type d -prune -exec rm -rf {} +
echo "vendored tbi into $here/pkg"
