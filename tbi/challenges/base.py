from __future__ import annotations

import random
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Sequence


class ItemBank:
    """Benchmark items for one challenge; draws never repeat within a season."""

    def __init__(self, items: Sequence[Any]):
        self.items = list(items)
        self.used: set[int] = set()

    def remaining(self) -> int:
        return len(self.items) - len(self.used)

    def draw(self, n: int, rng: random.Random) -> list[Any]:
        available = [i for i in range(len(self.items)) if i not in self.used]
        if len(available) < n:
            raise RuntimeError(f"only {len(available)} unused items left, need {n}")
        picked = sorted(rng.sample(available, n))
        self.used.update(picked)
        return [self.items[i] for i in picked]


@dataclass
class ChallengeResult:
    scores: dict[str, float]  # player -> normalized 0..1
    details: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        for p, s in self.scores.items():
            if not 0.0 <= s <= 1.0:
                raise ValueError(f"score for {p} not normalized: {s}")


class Challenge(ABC):
    """Adapter interface. `stage` is 'tribe' or 'individual'.

    The engine calls `setup()` once, then per round `sample(n, rng)` once (so
    every tribe faces the same items) and `run(players, models, items)` once per
    competing group (each tribe in the tribe stage, everyone after the merge).
    `run` returns a 0..1 score per player; a tribe's score is its members' mean.
    """

    name: str
    stage: str

    @abstractmethod
    def setup(self) -> None: ...

    @abstractmethod
    def sample(self, n_items: int, rng: random.Random) -> list[Any]: ...

    @abstractmethod
    def run(self, players: list[str], models: dict[str, str], items: list[Any]) -> ChallengeResult: ...


class ChallengePool:
    """Draw challenges without replacement, seeded."""

    def __init__(self, challenges: Sequence[Challenge]):
        self.challenges = list(challenges)
        self.remaining = list(range(len(self.challenges)))

    def draw(self, rng: random.Random) -> Challenge:
        if not self.remaining:
            raise RuntimeError("challenge pool exhausted")
        idx = rng.choice(self.remaining)
        self.remaining.remove(idx)
        return self.challenges[idx]

    def __len__(self) -> int:
        return len(self.remaining)
