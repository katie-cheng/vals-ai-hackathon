from tbi.elo import leaderboard, update_from_placements
from tbi.models import Budget, Completion, CostCapExceeded, extract_json

import pytest


def test_extract_json_tolerates_prose_and_fences():
    assert extract_json('sure! {"vote": "Ada"} hope that helps') == {"vote": "Ada"}
    assert extract_json('```json\n{"action": "pass"}\n```') == {"action": "pass"}
    assert extract_json("no json here") is None
    assert extract_json('{"a": {"b": 1}}') == {"a": {"b": 1}}


def test_budget_cap():
    b = Budget(0.1)
    b.record("x", Completion("", 10, 5, 0.06))
    with pytest.raises(CostCapExceeded):
        b.record("x", Completion("", 10, 5, 0.06))
    assert b.tokens["x"] == {"prompt": 20, "completion": 10}


def test_elo_winner_gains_and_loser_drops():
    placements = {"A": 1, "B": 2, "C": 3}
    models = {"A": "m1", "B": "m2", "C": "m3"}
    r = update_from_placements({}, placements, models)
    assert r["m1"] > 1000 > r["m3"]
    assert abs(r["m2"] - 1000) < 1e-9
    assert leaderboard(r)[0][0] == "m1"


def test_elo_same_model_contestants_do_not_play_each_other():
    r = update_from_placements({}, {"A": 1, "B": 2}, {"A": "m", "B": "m"})
    assert r.get("m", 1000) == 1000 or "m" not in r
