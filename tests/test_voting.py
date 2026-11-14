import random

from tbi.voting import leaders, resolve_council, tally


def test_tally_and_plurality():
    votes = {"a": "x", "b": "x", "c": "y"}
    assert tally(votes)["x"] == 2
    out = resolve_council(votes, lambda tied: {}, {}, random.Random(0))
    assert out.eliminated == "x" and out.method == "plurality" and len(out.ballots) == 1


def test_tie_goes_to_revote():
    votes = {"a": "x", "b": "y"}
    called = []

    def revote(tied):
        called.append(tied)
        return {"a": "y", "b": "y"}

    out = resolve_council(votes, revote, {"x": 0.9, "y": 0.1}, random.Random(0))
    assert called == [["x", "y"]]
    assert out.eliminated == "y" and out.method == "revote" and out.tied == ["x", "y"]


def test_double_tie_lowest_score_goes_home():
    votes = {"a": "x", "b": "y"}
    out = resolve_council(votes, lambda tied: {"a": "x", "b": "y"}, {"x": 0.9, "y": 0.1}, random.Random(0))
    assert out.eliminated == "y" and out.method == "lowest_score"


def test_double_tie_equal_scores_is_seeded_random():
    votes = {"a": "x", "b": "y"}
    picks = {resolve_council(votes, lambda t: dict(votes), {"x": 0.5, "y": 0.5}, random.Random(s)).eliminated for s in range(20)}
    assert picks == {"x", "y"}
    a = resolve_council(votes, lambda t: dict(votes), {"x": 0.5, "y": 0.5}, random.Random(4))
    b = resolve_council(votes, lambda t: dict(votes), {"x": 0.5, "y": 0.5}, random.Random(4))
    assert a.eliminated == b.eliminated and a.method == "random"


def test_leaders_sorted():
    assert leaders({"a": "z", "b": "y"}) == ["y", "z"]
    assert leaders({}) == []
