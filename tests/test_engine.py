import json

import pytest

from tbi.engine import Season, run_season
from tbi.events import EventLog
from tbi.models import CostCapExceeded, MockModel
from tbi.replay import rebuild

from conftest import make_cfg


def events_of(season, *types):
    return [e for e in season.log.events if e["type"] in types]


def test_full_season_runs_to_a_winner(cfg):
    s = Season(cfg)
    summary = s.run()
    assert summary["winner"] in {p.name for p in s.players}
    placements = summary["placements"]
    assert sorted(placements.values()) == list(range(1, 13))
    assert s.log.events[-1]["type"] == "season_end" and s.log.events[-1]["status"] == "finished"


def test_stage_transitions_and_merge(cfg):
    s = Season(cfg)
    s.run()
    rounds = events_of(s, "round_start")
    stages = [(r["round"], r["stage"], len(r["alive"])) for r in rounds]
    # 12 -> 6 alive in tribe stage (6 eliminations), merge at 6, then 6 -> 2 (4 eliminations)
    assert [st for _, st, _ in stages] == ["tribe"] * 6 + ["individual"] * 4
    merge = events_of(s, "merge")
    assert len(merge) == 1 and len(merge[0]["players"]) == 6
    assert sum(len(t) for t in rounds[0]["tribes"].values()) == 12 and len(rounds[0]["tribes"]) == 2


def test_challenges_drawn_without_replacement(cfg):
    s = Season(cfg)
    s.run()
    draws = [e["challenge"] for e in events_of(s, "challenge_draw")]
    assert len(draws) == len(set(draws)) == 10
    items = [tuple(e["items"]) for e in events_of(s, "challenge_draw")]
    flat = [i for it in items for i in it]
    assert len(flat) == len(set(flat)), "items reused within season"


def test_pool_exhaustion_is_an_error():
    cfg = make_cfg(tribe_pool=[{"type": "mock", "name": "only"}])
    with pytest.raises(RuntimeError, match="exhausted"):
        Season(cfg).run()


def test_immunity_tribe_stage_and_individual(cfg):
    s = Season(cfg)
    s.run()
    for imm, scores, rs in zip(events_of(s, "immunity"), events_of(s, "challenge_scores"), events_of(s, "round_start")):
        if rs["stage"] == "tribe":
            gs = scores["group_scores"]
            winning = {g for g in gs if g == max(gs, key=gs.get)} if imm["reason"] == "winning_tribe" else None
            if winning:
                assert set(imm["immune"]) == {n for g in winning for n in rs["tribes"][g]}
        else:
            top = max(scores["scores"].values())
            assert len(imm["immune"]) == 1 and scores["scores"][imm["immune"][0]] == top


def test_immune_players_never_receive_votes_and_voters_are_losing_tribe(cfg):
    s = Season(cfg)
    s.run()
    by_round = {}
    for e in s.log.events:
        by_round.setdefault(e.get("round"), []).append(e)
    for r, evs in by_round.items():
        if r is None:
            continue
        immune = next((e["immune"] for e in evs if e["type"] == "immunity"), [])
        start = next(e for e in evs if e["type"] == "round_start")
        votes = [e for e in evs if e["type"] == "vote"]
        for v in votes:
            assert v["target"] not in immune
            assert v["target"] != v["voter"]
            if start["stage"] == "tribe":
                assert v["voter"] not in immune, "winning tribe should not vote"
        elim = next(e for e in evs if e["type"] == "elimination")
        assert elim["player"] not in immune


def test_vote_tally_matches_elimination(cfg):
    s = Season(cfg)
    s.run()
    for e in events_of(s, "council_result"):
        if e["method"] == "plurality":
            final = e["ballots"][-1]
            counts = {}
            for t in final.values():
                counts[t] = counts.get(t, 0) + 1
            assert e["eliminated"] == max(counts, key=counts.get)
        elif e["method"] in {"revote", "lowest_score", "random"}:
            assert len(e["ballots"]) == 2 and e["eliminated"] in e["tied"]


def test_tie_break_paths_are_exercised():
    """Across seeds, a 2-player losing tribe forces a tie -> revote -> lowest-score path."""
    methods = set()
    for seed in range(12):
        s = Season(make_cfg(seed=seed, social_turns=1))
        s.run()
        methods |= {e["method"] for e in events_of(s, "council_result")}
    assert "plurality" in methods
    assert methods & {"revote", "lowest_score", "random", "sole_candidate"}, methods


def test_sole_remaining_tribe_member_is_eliminated_without_a_vote():
    class RiggedChallenge:
        name, stage = "rigged", "tribe"

        def setup(self):
            pass

        def sample(self, n, rng):
            return list(range(n))

        def run(self, players, models, items):
            from tbi.challenges import ChallengeResult

            return ChallengeResult({p: (0.0 if p in loser_names else 1.0) for p in players})

    cfg = make_cfg(n=8, merge_at=4, finale_at=2)
    s = Season(cfg, tribe_pool=[RiggedChallenge() for _ in range(6)])
    s.start()
    loser_tribe = sorted(s.tribes())[0]
    loser_names = set(s.tribes()[loser_tribe])
    while len(s.alive()) > cfg.merge_at:
        s.play_round()
    assert all(not s.by_name[n].alive for n in loser_names)
    assert events_of(s, "council_result")[-1]["method"] == "sole_candidate"


def test_social_visibility_and_actions(cfg):
    s = Season(cfg)
    s.run()
    msgs = events_of(s, "message")
    assert msgs, "mock model should post messages"
    kinds = {m["kind"] for m in msgs}
    assert "dm" in kinds and "group" in kinds and "tribe" in kinds
    for m in msgs:
        assert m["sender"] in m["recipients"]
        if m["kind"] == "dm":
            assert len(m["recipients"]) == 2
    # pre-merge DMs stay within tribes
    tribes = events_of(s, "season_start")[0]["tribes"]
    tribe_of = {n: t for t, ms in tribes.items() for n in ms}
    merge_round = events_of(s, "merge")[0]["round"]
    for m in msgs:
        if m["round"] < merge_round and m["kind"] == "dm":
            a, b = m["recipients"]
            assert tribe_of[a] == tribe_of[b]
    # notes persist
    assert events_of(s, "notes_update")


def test_jury_votes_decide_winner(cfg):
    s = Season(cfg)
    s.run()
    fin = events_of(s, "finale_start")[0]
    assert len(fin["finalists"]) == 2 and len(fin["jury"]) == 4  # post-merge eliminations
    jv = events_of(s, "jury_vote")
    assert {v["voter"] for v in jv} == set(fin["jury"])
    assert all(v["target"] in fin["finalists"] for v in jv)
    w = events_of(s, "winner")[0]
    assert w["player"] in fin["finalists"]
    assert w["counts"][w["player"]] == max(w["counts"].values())


def test_cost_cap_aborts_season():
    cfg = make_cfg(cost_cap_usd=0.05)
    s = Season(cfg, client=MockModel(seed=1, cost_per_call=0.01))
    summary = s.run()
    end = s.log.events[-1]
    assert end["type"] == "season_end" and end["status"] == "aborted"
    assert summary["winner"] is None
    assert s.budget.total_cost_usd > 0.05


def test_log_is_deterministic_and_replayable(tmp_path):
    p1, p2 = tmp_path / "a.jsonl", tmp_path / "b.jsonl"
    s1 = run_season(make_cfg(seed=11), p1)
    s2 = run_season(make_cfg(seed=11), p2)
    e1 = [{k: v for k, v in e.items() if k != "ts"} for e in EventLog.read(p1)]
    e2 = [{k: v for k, v in e.items() if k != "ts"} for e in EventLog.read(p2)]
    assert e1 == e2
    assert s1["placements"] == s2["placements"]
    rebuilt = rebuild(EventLog.read(p1))
    assert rebuilt["winner"] == s1["winner"]
    assert rebuilt["placements"] == s1["placements"]
    assert rebuilt["finished"]
    for line in p1.read_text().splitlines():
        json.loads(line)


def test_different_seed_changes_outcome():
    a = Season(make_cfg(seed=1)).run()
    b = Season(make_cfg(seed=2)).run()
    assert a["placements"] != b["placements"]


def test_invalid_model_output_falls_back_gracefully():
    class Garbage:
        def complete(self, req):
            from tbi.models import Completion

            return Completion(text="I refuse to answer in JSON")

    s = Season(make_cfg(social_turns=1), client=Garbage())
    summary = s.run()
    assert summary["winner"] is not None
    assert events_of(s, "parse_error") and events_of(s, "invalid_vote")
