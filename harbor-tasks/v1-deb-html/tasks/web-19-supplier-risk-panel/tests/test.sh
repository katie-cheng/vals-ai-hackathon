#!/bin/bash
set -u
mkdir -p /logs/verifier
python3 /tests/render.py || echo '{"reward": 0, "verifier_error": 1}' > /logs/verifier/reward.json
