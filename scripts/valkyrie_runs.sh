#!/bin/bash
# Pushes the DEB v2 Harbor tasks to Valkyrie and starts one run per model.
# Every model runs on the same harness (terminus2, LiteLLM) at reasoning_effort=high, so scores compare models, not harnesses.
#
#   ANTHROPIC_SECRET=<valkyrie secret name> OPENAI_SECRET=<name> [MODAL_PROXY_SECRET=<name>] scripts/valkyrie_runs.sh
#
# Secret names come from `valkyrie secret list`; never pass raw keys. Set PUSH=0 to reuse an already pushed version,
# ATTEMPTS=<1-10> for independent runs per model, ONLY="<model> ..." to start a subset.
# ORACLE=1 first runs each task's golden solution (no model cost) to check the tasks build and grade on Valkyrie.
set -euo pipefail
cd "$(dirname "$0")/.."

ORG=hackathon-what-does-the-fox-say-c2f1ff2066
DATASET=${DATASET:-deb/slopbench}
TAG=${TAG:-v1}
AGENT=${AGENT:-terminus2}
EFFORT=${EFFORT:-high}
ATTEMPTS=${ATTEMPTS:-1}
CONCURRENCY=${CONCURRENCY:-4}

# model | env var the harness reads | secret holding it
MODELS=(
  "anthropic/claude-opus-5-5|ANTHROPIC_API_KEY|${ANTHROPIC_SECRET:-}"
  "anthropic/claude-fable-5-2|ANTHROPIC_API_KEY|${ANTHROPIC_SECRET:-}"
  "openai/gpt-6.1-sol|OPENAI_API_KEY|${OPENAI_SECRET:-}"
  "openai/gpt-6-astra|OPENAI_API_KEY|${OPENAI_SECRET:-}"
)

# Open models on shared Modal Endpoints (OpenAI-compatible): model | secret holding the endpoint's base URL.
# The proxy key secret authenticates every endpoint.
OPEN_MODELS=(
  "openai/moonshotai/Kimi-K3.1-Pro|kimi-k3-1-pro-url"
  "openai/deepseek-ai/DeepSeek-V4.1-Flash-1017|deepseek-v4-1-flash-1017-url"
  "openai/meta-models/Muse-Spark-Open-816B-A42B|muse-spark-open-816b-a42b-url"
  "openai/nvidia/GLM-5.3-Flash-NVFP4|glm-5-3-flash-nvfp4-url"
)
MODAL_PROXY_SECRET=${MODAL_PROXY_SECRET:-}
# it-beginner-platform repeats the it-beginner brief, so it stays out of the dataset.
SKIP_TASKS=" it-beginner-platform "

# An access key (VALKYRIE_API_KEY) is already bound to its org, and `org use` refuses it.
valkyrie whoami | grep -q "$ORG" || valkyrie org use "$ORG"
tasks/sync-verifier.sh --check

if [ "${PUSH:-1}" = 1 ]; then
  # Only task directories go up; tasks/verifier/ and the docs are not tasks.
  staging=$(mktemp -d)
  trap 'rm -rf "$staging"' EXIT
  for toml in tasks/*/task.toml; do
    dir=$(dirname "$toml")
    [[ "$SKIP_TASKS" == *" $(basename "$dir") "* ]] || cp -a "$dir" "$staging/"
  done
  echo "pushing $(ls "$staging" | tr '\n' ' ')as $DATASET@$TAG"
  valkyrie dataset push "$DATASET" "$staging" --tag "$TAG"
fi

if [ "${ORACLE:-0}" = 1 ]; then
  valkyrie run start --agent oracle --dataset "$DATASET@$TAG" --provider modal --concurrency "$CONCURRENCY" -l "deb-$TAG-oracle"
fi

for row in "${MODELS[@]}"; do
  IFS='|' read -r model env secret <<<"$row"
  if [ -n "${ONLY:-}" ] && [[ " $ONLY " != *" $model "* ]]; then continue; fi
  if [ -z "$secret" ]; then echo "skip $model: no secret for $env"; continue; fi
  echo "start $model"
  valkyrie run start --agent "$AGENT" --dataset "$DATASET@$TAG" --model "$model" --provider modal \
    -s "$env" "$secret" -k reasoning_effort "$EFFORT" -n "$ATTEMPTS" --concurrency "$CONCURRENCY" -l "deb-$TAG"
done
for row in "${OPEN_MODELS[@]}"; do
  IFS='|' read -r model url <<<"$row"
  if [ -n "${ONLY:-}" ] && [[ " $ONLY " != *" $model "* ]]; then continue; fi
  if [ -z "$MODAL_PROXY_SECRET" ]; then echo "skip $model: no MODAL_PROXY_SECRET"; continue; fi
  echo "start $model"
  valkyrie run start --agent "$AGENT" --dataset "$DATASET@$TAG" --model "$model" --provider modal \
    -s OPENAI_API_KEY "$MODAL_PROXY_SECRET" -s OPENAI_BASE_URL "$url" -k reasoning_effort "$EFFORT" \
    -n "$ATTEMPTS" --concurrency "$CONCURRENCY" -l "deb-$TAG-open"
done
echo "watch with: valkyrie tui"
