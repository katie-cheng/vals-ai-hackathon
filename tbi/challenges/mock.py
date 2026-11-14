from __future__ import annotations

import hashlib
import random
from typing import Any

from .base import Challenge, ChallengeResult, ItemBank


class MockChallenge(Challenge):
    """No-API challenge. Scores are a deterministic hash of (salt, player, item),
    so a 'skill' per player name emerges but nothing is called."""

    def __init__(self, name: str, stage: str, num_items: int = 100, salt: str = ""):
        self.name = name
        self.stage = stage
        self.salt = salt
        self.bank = ItemBank([f"{name}-item-{i:03d}" for i in range(num_items)])
        self.ready = False

    def setup(self) -> None:
        self.ready = True

    def sample(self, n_items: int, rng: random.Random) -> list[Any]:
        return self.bank.draw(n_items, rng)

    def _item_score(self, player: str, item: str) -> float:
        h = hashlib.sha256(f"{self.salt}|{player}|{item}".encode()).digest()
        return int.from_bytes(h[:4], "big") / 0xFFFFFFFF

    def run(self, players: list[str], models: dict[str, str], items: list[Any]) -> ChallengeResult:
        if not self.ready:
            raise RuntimeError("setup() not called")
        scores = {p: sum(self._item_score(p, it) > 0.5 for it in items) / len(items) for p in players}
        return ChallengeResult(scores=scores, details={"kind": "mock"})
