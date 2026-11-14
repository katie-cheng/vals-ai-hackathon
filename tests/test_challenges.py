import random

import pytest

from tbi.challenges import ChallengePool, ItemBank, MockChallenge


def test_item_bank_never_reuses_items():
    bank = ItemBank(list(range(30)))
    rng = random.Random(1)
    seen = []
    for _ in range(3):
        seen += bank.draw(10, rng)
    assert len(seen) == 30 and len(set(seen)) == 30
    with pytest.raises(RuntimeError):
        bank.draw(1, rng)


def test_pool_draws_without_replacement_and_is_seeded():
    def pool():
        return ChallengePool([MockChallenge(f"c{i}", "tribe") for i in range(5)])

    a = [pool().draw(random.Random(3)).name for _ in range(1)]
    p1, p2 = pool(), pool()
    r1, r2 = random.Random(9), random.Random(9)
    seq1 = [p1.draw(r1).name for _ in range(5)]
    seq2 = [p2.draw(r2).name for _ in range(5)]
    assert seq1 == seq2
    assert sorted(seq1) == [f"c{i}" for i in range(5)]
    with pytest.raises(RuntimeError):
        p1.draw(r1)
    assert a  # seeded single draw is deterministic too


def test_mock_challenge_scores_normalized_and_deterministic():
    c = MockChallenge("x", "individual", salt="s")
    c.setup()
    items = c.sample(10, random.Random(0))
    r1 = c.run(["A", "B"], {"A": "m", "B": "m"}, items)
    r2 = c.run(["A", "B"], {"A": "m", "B": "m"}, items)
    assert r1.scores == r2.scores
    assert all(0.0 <= s <= 1.0 for s in r1.scores.values())
