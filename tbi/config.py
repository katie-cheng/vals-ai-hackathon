from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import yaml


@dataclass
class PlayerConfig:
    name: str
    model: str
    params: dict[str, Any] = field(default_factory=dict)


@dataclass
class SeasonConfig:
    season_id: str
    seed: int
    players: list[PlayerConfig]
    num_tribes: int = 2
    merge_at: int = 6
    finale_at: int = 2
    social_turns: int = 5
    items_per_challenge: int = 10
    max_tokens_per_turn: int = 400
    cost_cap_usd: float = 5.0
    history_chars: int = 6000
    notes_chars: int = 2000
    jury: str = "post_merge"
    tribe_pool: list[dict[str, Any]] = field(default_factory=list)
    individual_pool: list[dict[str, Any]] = field(default_factory=list)
    model_client: dict[str, Any] = field(default_factory=lambda: {"type": "mock"})

    def __post_init__(self) -> None:
        n = len(self.players)
        if not 2 <= n:
            raise ValueError("need at least 2 players")
        if len({p.name for p in self.players}) != n:
            raise ValueError("player names must be unique")
        if not 1 <= self.finale_at < self.merge_at <= n:
            raise ValueError("require 1 <= finale_at < merge_at <= players")
        if self.num_tribes < 1:
            raise ValueError("num_tribes must be >= 1")


def load_config(path: str | Path) -> SeasonConfig:
    raw = yaml.safe_load(Path(path).read_text())
    return config_from_dict(raw)


def config_from_dict(raw: dict[str, Any]) -> SeasonConfig:
    raw = dict(raw)
    players = [PlayerConfig(**p) if isinstance(p, dict) else PlayerConfig(name=p, model="mock") for p in raw.pop("players")]
    return SeasonConfig(players=players, **raw)
