#!/bin/bash
# Rebuilds the agent's app from source, then grades the build. A failed build is the agent's failure (reward 0);
# a grader crash writes no reward, so Harbor reports a verifier error instead of blaming the agent.
set -uo pipefail
OUT=/logs/verifier
# The grader's own browsers, copied in the image; the agent may have replaced the ones in /ms-playwright.
export PLAYWRIGHT_BROWSERS_PATH=/opt/verifier/browsers
mkdir -p "$OUT"

cd /app
rm -rf /app/dist
if ! npm run build >"$OUT/build.log" 2>&1 || [ ! -f /app/dist/index.html ]; then
  echo "build failed; see build.log"
  echo '{"reward": 0, "requirements": 0, "task": 0, "baseline": 0, "slop": 0, "gate": 0}' >"$OUT/reward.json"
  exit 0
fi

node /tests/grade.mjs --dist /app/dist --out "$OUT"
