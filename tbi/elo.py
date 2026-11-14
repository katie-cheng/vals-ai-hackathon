from __future__ import annotations

from collections import defaultdict
from typing import Iterable


def expected(ra: float, rb: float) -> float:
    return 1.0 / (1.0 + 10 ** ((rb - ra) / 400.0))


def update_from_placements(
    ratings: dict[str, float],
    placements: dict[str, int],
    models: dict[str, str],
    k: float = 32.0,
    default: float = 1000.0,
) -> dict[str, float]:
    """Multiplayer Elo from a season's finishing order (1 = winner).

    Every pair of contestants is a head-to-head; the per-pair K is scaled by
    1/(n-1) so one season moves a rating by at most ~K. Contestants map to
    models so ratings are per model, and a model fielding several contestants
    gets the average of their deltas.
    """
    players = list(placements)
    n = len(players)
    if n < 2:
        return dict(ratings)
    deltas: dict[str, list[float]] = defaultdict(list)
    r = {p: ratings.get(models[p], default) for p in players}
    per_player = defaultdict(float)
    for i, a in enumerate(players):
        for b in players[i + 1 :]:
            if models[a] == models[b]:
                continue
            sa = 1.0 if placements[a] < placements[b] else 0.0 if placements[a] > placements[b] else 0.5
            ea = expected(r[a], r[b])
            d = k / (n - 1) * (sa - ea)
            per_player[a] += d
            per_player[b] -= d
    for p, d in per_player.items():
        deltas[models[p]].append(d)
    out = dict(ratings)
    for m, ds in deltas.items():
        out[m] = out.get(m, default) + sum(ds) / len(ds)
    return out


def leaderboard(ratings: dict[str, float]) -> list[tuple[str, float]]:
    return sorted(ratings.items(), key=lambda kv: -kv[1])
