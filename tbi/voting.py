from __future__ import annotations

import random
from collections import Counter
from dataclasses import dataclass, field


def tally(votes: dict[str, str]) -> Counter:
    return Counter(votes.values())


def leaders(votes: dict[str, str]) -> list[str]:
    counts = tally(votes)
    if not counts:
        return []
    top = max(counts.values())
    return sorted(p for p, c in counts.items() if c == top)


@dataclass
class CouncilOutcome:
    eliminated: str
    ballots: list[dict[str, str]]
    method: str  # plurality | revote | lowest_score | sole_member | random
    tied: list[str] = field(default_factory=list)


def resolve_council(
    first_ballot: dict[str, str],
    revote_fn,
    scores: dict[str, float],
    rng: random.Random,
) -> CouncilOutcome:
    """Plurality wins. Tie -> one revote among the tied; still tied -> lowest
    challenge score this round goes home; equal scores -> seeded random."""
    ballots = [dict(first_ballot)]
    top = leaders(first_ballot)
    if len(top) == 1:
        return CouncilOutcome(top[0], ballots, "plurality")
    tied = top
    second = revote_fn(tied)
    ballots.append(dict(second))
    top2 = leaders(second)
    if len(top2) == 1:
        return CouncilOutcome(top2[0], ballots, "revote", tied)
    still = top2 or tied
    low = min(scores.get(p, 0.0) for p in still)
    lowest = sorted(p for p in still if scores.get(p, 0.0) == low)
    if len(lowest) == 1:
        return CouncilOutcome(lowest[0], ballots, "lowest_score", still)
    return CouncilOutcome(rng.choice(lowest), ballots, "random", still)
