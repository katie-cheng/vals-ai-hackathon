import pytest

from tbi.config import config_from_dict

NAMES = ["Ada", "Bao", "Cleo", "Dev", "Eli", "Fay", "Gus", "Hana", "Ivo", "Jun", "Kai", "Lior"]


def make_cfg(n=12, seed=7, **over):
    raw = {
        "season_id": "test",
        "seed": seed,
        "players": [{"name": nm, "model": f"mock/{nm.lower()}"} for nm in NAMES[:n]],
        "num_tribes": 2,
        "merge_at": 6,
        "finale_at": 2,
        "social_turns": 2,
        "items_per_challenge": 5,
        "cost_cap_usd": 10.0,
        "tribe_pool": [{"type": "mock", "name": f"t{i}", "num_items": 40} for i in range(8)],
        "individual_pool": [{"type": "mock", "name": f"i{i}", "num_items": 40} for i in range(6)],
    }
    raw.update(over)
    return config_from_dict(raw)


@pytest.fixture
def cfg():
    return make_cfg()
