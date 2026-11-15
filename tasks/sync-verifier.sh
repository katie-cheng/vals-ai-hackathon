#!/bin/bash
# Copies the shared verifier in tasks/verifier/ into the tests/ of every task (each directory with a task.toml).
# Harbor ships only a task's own tests/ to the container, so every task carries a copy; only tests/task.mjs differs per task.
# --check changes nothing and exits 1 if any copy is stale or a task lacks its task.mjs.
set -euo pipefail
cd "$(dirname "$0")"
SHARED=(grade.mjs probe.mjs lib.mjs test.sh)
check=0
[ "${1:-}" = "--check" ] && check=1
status=0
for toml in */task.toml; do
  tests="$(dirname "$toml")/tests"
  mkdir -p "$tests"
  for f in "${SHARED[@]}"; do
    cmp -s "verifier/$f" "$tests/$f" && continue
    if [ "$check" = 1 ]; then
      echo "stale: $tests/$f"
      status=1
    else
      cp -p "verifier/$f" "$tests/$f"
      echo "updated: $tests/$f"
    fi
  done
  [ -f "$tests/task.mjs" ] || { echo "missing: $tests/task.mjs"; status=1; }
done
exit "$status"
