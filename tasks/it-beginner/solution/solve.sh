#!/bin/bash
# Oracle: replaces the template with the golden reference site (solution/app) and installs its dependencies.
set -euo pipefail
if [ ! -f /solution/app/package.json ]; then
  echo "solution/app is missing: the golden reference has not been built yet" >&2
  exit 1
fi
find /app -mindepth 1 -maxdepth 1 ! -name node_modules -exec rm -rf {} +
cp -a /solution/app/. /app/
cd /app
npm install --no-audit --no-fund
