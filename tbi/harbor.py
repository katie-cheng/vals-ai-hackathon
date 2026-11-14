"""Emit a Harbor dataset: one task per contestant, graded by final placement.

Valkyrie runs the dataset with the `tbi-contestant` agent (see agents/tbi-contestant):
one sandbox per contestant for the whole season. `tests/test.sh` asks the hub for the
player's placement and writes it as the reward (winner = 1.0, first out = 0.0).
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from .config import SeasonConfig
from .prompts import RULES

DOCKERFILE = """FROM python:3.12-slim
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates git \\
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
"""

TEST_SH = """#!/bin/bash
set -euo pipefail
mkdir -p /logs/verifier
python3 - <<'PY'
import json, os, time, urllib.request, urllib.error
url = f"{os.environ['TBI_HUB_URL'].rstrip('/')}/seasons/{os.environ['TBI_SEASON']}/placements/{os.environ['TBI_PLAYER']}"
deadline = time.time() + float(os.environ.get("TBI_PLACEMENT_WAIT", "600"))
while True:
    try:
        with urllib.request.urlopen(url, timeout=30) as r:
            data = json.load(r)
        break
    except urllib.error.HTTPError as e:
        if e.code != 409 or time.time() > deadline:
            raise
        time.sleep(10)
json.dump(data, open("/logs/verifier/placement.json", "w"), indent=2)
open("/logs/verifier/reward.txt", "w").write(str(data["reward"]))
print(f"{data['player']}: placement {data['placement']}/{data['players']} reward {data['reward']}")
PY
"""

METRIC_PY = """\"\"\"Dataset score = mean reward (placement-normalised) across contestants.\"\"\"


def metric(rewards):
    rewards = [r for r in rewards if r is not None]
    return sum(rewards) / len(rewards) if rewards else 0.0
"""


def instruction_md(cfg: SeasonConfig, player: str, model: str, hub_url: str) -> str:
    coords = {"hub": hub_url, "season": cfg.season_id, "player": player, "model": model}
    return (
        f"# Total Benchmark Island — season `{cfg.season_id}`, contestant `{player}`\n\n"
        f"You are **{player}**, playing as `{model}`. Connect to the hub and play until the season ends.\n\n"
        "```json\n" + json.dumps(coords, indent=2) + "\n```\n\n"
        "Run `tbi-agent --instruction <this file>`; the join token arrives as `TBI_JOIN_TOKEN`.\n\n"
        "## Rules\n\n" + RULES.format(merge_at=cfg.merge_at, finale_at=cfg.finale_at, social_turns=cfg.social_turns) + "\n"
    )


def task_toml(cfg: SeasonConfig, player: str, model: str, hub_url: str, agent_timeout_sec: int) -> str:
    return (
        'schema_version = "1.4"\n\n'
        "[task]\n"
        f'name = "tbi/{cfg.season_id}-{player.lower()}"\n'
        'description = "Total Benchmark Island contestant: one sandbox for a whole season"\n\n'
        "[metadata]\n"
        f'season = "{cfg.season_id}"\nplayer = "{player}"\nmodel = "{model}"\n'
        'category = "multi-agent-game"\n\n'
        "[verifier]\n"
        "timeout_sec = 900\n"
        f'env = {{ TBI_HUB_URL = "{hub_url}", TBI_SEASON = "{cfg.season_id}", TBI_PLAYER = "{player}" }}\n\n'
        "[agent]\n"
        f"timeout_sec = {agent_timeout_sec}\n\n"
        "[environment]\n"
        'network_mode = "public"\n'
        "cpus = 1\nmemory_mb = 2048\n"
    )


def write_dataset(cfg: SeasonConfig, out_dir: str | Path, hub_url: str, agent_timeout_sec: int = 6 * 3600) -> list[Path]:
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    (out / "metric.py").write_text(METRIC_PY)
    paths = []
    for p in cfg.players:
        d = out / p.name
        (d / "tests").mkdir(parents=True, exist_ok=True)
        (d / "environment").mkdir(exist_ok=True)
        (d / "instruction.md").write_text(instruction_md(cfg, p.name, p.model, hub_url))
        (d / "task.toml").write_text(task_toml(cfg, p.name, p.model, hub_url, agent_timeout_sec))
        (d / "environment" / "Dockerfile").write_text(DOCKERFILE)
        test = d / "tests" / "test.sh"
        test.write_text(TEST_SH)
        test.chmod(0o755)
        paths.append(d)
    return paths


def season_request(cfg_raw: dict[str, Any], join_token: str | None, turn_timeout: float) -> dict[str, Any]:
    return {"config": cfg_raw, "join_token": join_token, "turn_timeout": turn_timeout, "start_mode": "all_registered"}
