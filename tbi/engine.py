from __future__ import annotations

import random
import string
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from . import prompts
from .challenges import Challenge, ChallengePool, build_pool
from .config import SeasonConfig
from .events import EventLog
from .models import Budget, CostCapExceeded, ModelClient, ModelRequest, extract_json, make_client
from .social import SocialState, render_history
from .voting import CouncilOutcome, resolve_council


@dataclass
class Player:
    name: str
    model: str
    params: dict[str, Any] = field(default_factory=dict)
    tribe: str | None = None
    alive: bool = True
    placement: int | None = None
    total_score: float = 0.0


class Season:
    def __init__(
        self,
        cfg: SeasonConfig,
        client: ModelClient | None = None,
        log: EventLog | None = None,
        tribe_pool: list[Challenge] | None = None,
        individual_pool: list[Challenge] | None = None,
    ):
        self.cfg = cfg
        self.rng = random.Random(cfg.seed)
        self.client = client or make_client(cfg.model_client, cfg.seed)
        self.log = log or EventLog(None)
        self.budget = Budget(cfg.cost_cap_usd)
        self.players = [Player(p.name, p.model, dict(p.params)) for p in cfg.players]
        self.by_name = {p.name: p for p in self.players}
        salt = f"{cfg.season_id}:{cfg.seed}"
        self.tribe_pool = ChallengePool(tribe_pool if tribe_pool is not None else build_pool(cfg.tribe_pool, "tribe", salt))
        self.individual_pool = ChallengePool(
            individual_pool if individual_pool is not None else build_pool(cfg.individual_pool, "individual", salt)
        )
        for ch in [*self.tribe_pool.challenges, *self.individual_pool.challenges]:
            ch.setup()
        self.social = SocialState()
        self.round = 0
        self.merged = False
        self.eliminated: list[str] = []
        self.jury: list[str] = []
        self.winner: str | None = None
        self.immune: list[str] = []
        self.round_scores: dict[str, float] = {}

    # ----- helpers -------------------------------------------------------
    def alive(self) -> list[Player]:
        return [p for p in self.players if p.alive]

    def alive_names(self) -> list[str]:
        return [p.name for p in self.alive()]

    def tribes(self) -> dict[str, list[str]]:
        out: dict[str, list[str]] = {}
        for p in self.alive():
            out.setdefault(p.tribe, []).append(p.name)
        return out

    @property
    def stage(self) -> str:
        return "individual" if self.merged else "tribe"

    def tribe_channel(self, tribe: str) -> str:
        return f"tribe:{tribe}"

    def speaking_scope(self, player: Player) -> list[str]:
        """Who a player can message: tribe mates before the merge, everyone after."""
        if self.merged:
            return [n for n in self.alive_names() if n != player.name]
        return [n for n in self.tribes()[player.tribe] if n != player.name]

    def default_channel(self, player: Player) -> str:
        return "public" if self.merged else self.tribe_channel(player.tribe)

    # ----- lifecycle -----------------------------------------------------
    def run(self) -> dict[str, Any]:
        try:
            self.start()
            while len(self.alive()) > self.cfg.finale_at:
                self.play_round()
            self.finale()
            self.log.emit("season_end", status="finished", winner=self.winner, budget=self.budget.snapshot())
        except CostCapExceeded as e:
            self.log.emit("season_end", status="aborted", reason=str(e), budget=self.budget.snapshot())
        finally:
            self.log.close()
        return self.summary()

    def start(self) -> None:
        names = self.alive_names()
        self.rng.shuffle(names)
        labels = string.ascii_uppercase
        for i, n in enumerate(names):
            self.by_name[n].tribe = labels[i % self.cfg.num_tribes]
        for t, members in self.tribes().items():
            self.social.add_channel(self.tribe_channel(t), "tribe", members)
        self.social.add_channel("public", "public", self.alive_names())
        self.log.emit(
            "season_start",
            season_id=self.cfg.season_id,
            seed=self.cfg.seed,
            players=[{"name": p.name, "model": p.model, "tribe": p.tribe} for p in self.players],
            tribes=self.tribes(),
            config={
                "merge_at": self.cfg.merge_at,
                "finale_at": self.cfg.finale_at,
                "social_turns": self.cfg.social_turns,
                "items_per_challenge": self.cfg.items_per_challenge,
            },
        )

    def maybe_merge(self) -> None:
        if not self.merged and len(self.alive()) <= self.cfg.merge_at:
            self.merged = True
            for p in self.alive():
                p.tribe = "merged"
            self.social.add_channel("merged", "tribe", self.alive_names())
            self.log.emit("merge", round=self.round, players=self.alive_names())

    def play_round(self) -> None:
        self.round += 1
        self.maybe_merge()
        self.log.emit("round_start", round=self.round, stage=self.stage, alive=self.alive_names(), tribes=self.tribes())
        challenge, group_scores = self.run_challenge()
        self.assign_immunity(group_scores)
        self.social_phase()
        self.tribal_council(group_scores)

    # ----- challenge -----------------------------------------------------
    def run_challenge(self) -> tuple[Challenge, dict[str, float]]:
        pool = self.individual_pool if self.merged else self.tribe_pool
        challenge = pool.draw(self.rng)
        items = challenge.sample(self.cfg.items_per_challenge, self.rng)
        self.log.emit("challenge_draw", round=self.round, stage=self.stage, challenge=challenge.name, items=items, pool_remaining=len(pool))
        models = {p.name: p.model for p in self.alive()}
        scores: dict[str, float] = {}
        details: dict[str, Any] = {}
        groups = {"all": self.alive_names()} if self.merged else self.tribes()
        for g, members in groups.items():
            result = challenge.run(members, {m: models[m] for m in members}, items)
            missing = set(members) - set(result.scores)
            if missing:
                raise RuntimeError(f"challenge {challenge.name} returned no score for {sorted(missing)}")
            scores.update({m: result.scores[m] for m in members})
            details[g] = result.details
        group_scores = {g: sum(scores[m] for m in members) / len(members) for g, members in groups.items()}
        for n, s in scores.items():
            self.by_name[n].total_score += s
        self.round_scores = scores
        self.log.emit("challenge_scores", round=self.round, challenge=challenge.name, scores=scores, group_scores=group_scores, details=details)
        return challenge, group_scores

    def assign_immunity(self, group_scores: dict[str, float]) -> None:
        if self.merged:
            top = max(self.round_scores.values())
            winners = sorted(n for n, s in self.round_scores.items() if s == top)
            self.immune = [self.rng.choice(winners)] if len(winners) > 1 else winners
            reason = "top_individual_score" + ("_tiebreak_random" if len(winners) > 1 else "")
        else:
            low = min(group_scores.values())
            lowest = sorted(g for g, s in group_scores.items() if s == low)
            if len(lowest) > 1:  # tied for last: seeded coin flip picks the loser
                loser = self.rng.choice(lowest)
                reason = "tribe_tie_random"
            else:
                loser = lowest[0]
                reason = "winning_tribe"
            tribes = self.tribes()
            self.immune = sorted(n for g, names in tribes.items() if g != loser for n in names)
            self._losing_tribes = [loser]
        self.log.emit("immunity", round=self.round, immune=self.immune, reason=reason)

    # ----- model calls ---------------------------------------------------
    def base_state(self, player: Player) -> dict[str, Any]:
        return {
            "round": self.round,
            "stage": self.stage,
            "tribes": self.tribes(),
            "alive": self.alive_names(),
            "scores": self.round_scores,
            "immune": self.immune,
            "eliminated": self.eliminated,
            "channels": [c.id for c in self.social.visible_channels(player.name)],
            "notes": self.social.notes.get(player.name, ""),
            "history": render_history(self.social.visible_messages(player.name), self.social.channels, self.cfg.history_chars),
        }

    def ask(self, player: Player, kind: str, instruction: str, state: dict[str, Any], meta: dict[str, Any]) -> dict[str, Any] | None:
        req = ModelRequest(
            player=player.name,
            model=player.model,
            system=prompts.system_prompt(self.cfg, player, state),
            messages=[{"role": "user", "content": instruction}],
            max_tokens=self.cfg.max_tokens_per_turn,
            kind=kind,
            meta=meta,
            params=player.params,
        )
        try:
            completion = self.client.complete(req)
        except CostCapExceeded:
            raise
        except Exception as e:  # noqa: BLE001 - a flaky provider should not kill the season
            self.log.emit("model_error", round=self.round, player=player.name, kind=kind, error=str(e))
            return None
        self.log.emit(
            "model_call",
            round=self.round,
            player=player.name,
            model=player.model,
            kind=kind,
            prompt_tokens=completion.prompt_tokens,
            completion_tokens=completion.completion_tokens,
            cost_usd=completion.cost_usd,
            raw=completion.text,
        )
        self.budget.record(player.name, completion)
        parsed = extract_json(completion.text)
        if parsed is None:
            self.log.emit("parse_error", round=self.round, player=player.name, kind=kind)
        return parsed

    def apply_notes(self, player: Player, parsed: dict[str, Any] | None) -> None:
        if parsed and isinstance(parsed.get("notes"), str):
            self.social.notes[player.name] = parsed["notes"][: self.cfg.notes_chars]
            self.log.emit("notes_update", round=self.round, player=player.name, notes=self.social.notes[player.name])

    # ----- social phase --------------------------------------------------
    def social_phase(self) -> None:
        for turn in range(1, self.cfg.social_turns + 1):
            order = self.alive()
            self.rng.shuffle(order)
            for player in order:
                self.social_turn(player, turn)

    def social_turn(self, player: Player, turn: int) -> None:
        scope = self.speaking_scope(player)
        groups = [c.id for c in self.social.groups_for(player.name)]
        state = self.base_state(player)
        state.update(turn=turn, turns=self.cfg.social_turns, players=scope, groups=groups, channel=self.default_channel(player))
        meta = {"players": [player.name, *scope], "groups": groups}
        parsed = self.ask(player, "social", prompts.social_instruction(player, state), state, meta)
        self.apply_notes(player, parsed)
        action = (parsed or {}).get("action", "pass")
        text = str((parsed or {}).get("text", "")).strip()

        def invalid(reason: str) -> None:
            self.log.emit("invalid_action", round=self.round, player=player.name, turn=turn, action=parsed, reason=reason)

        if action == "pass" or parsed is None:
            self.log.emit("pass", round=self.round, player=player.name, turn=turn)
            return
        if not text:
            return invalid("empty text")
        if action == "dm":
            to = parsed.get("to")
            if to not in scope:
                return invalid(f"cannot dm {to!r}")
            ch = self.social.ensure_dm(player.name, to)
            self.post(ch.id, player, text, turn)
        elif action == "group":
            gid = str(parsed.get("group", "")).strip()
            if not gid:
                return invalid("missing group name")
            gid = gid if gid.startswith("group:") else f"group:{gid}"
            ch = self.social.channels.get(gid)
            if ch is None:
                raw_members = parsed.get("members") or []
                members = [m for m in raw_members if isinstance(m, str) and m in scope] if isinstance(raw_members, list) else []
                if not members:
                    return invalid("new group needs valid members")
                ch = self.social.add_channel(gid, "group", [player.name, *members], creator=player.name)
                self.log.emit("group_created", round=self.round, group=gid, creator=player.name, members=sorted(ch.members))
            elif player.name not in ch.members:
                return invalid(f"not a member of {gid}")
            self.post(gid, player, text, turn)
        elif action == "channel":
            self.post(self.default_channel(player), player, text, turn)
        else:
            invalid(f"unknown action {action!r}")

    def post(self, channel: str, player: Player, text: str, turn: int) -> None:
        m = self.social.post(self.round, channel, player.name, text)
        ch = self.social.channels[channel]
        self.log.emit("message", round=self.round, turn=turn, message_seq=m.seq, channel=channel, kind=ch.kind, sender=player.name, recipients=sorted(ch.members), text=text)

    # ----- tribal council ------------------------------------------------
    def tribal_council(self, group_scores: dict[str, float]) -> None:
        if self.merged:
            voters = self.alive_names()
        else:
            losing = self._losing_tribes
            voters = sorted(n for g in losing for n in self.tribes()[g])
        candidates = [v for v in voters if v not in self.immune]
        self.log.emit("council_start", round=self.round, voters=voters, candidates=candidates)
        if len(candidates) == 1:
            self.eliminate(candidates[0], CouncilOutcome(candidates[0], [], "sole_candidate"))
            return
        if not candidates:
            raise RuntimeError("tribal council with no eligible candidates")

        def ballot(eligible: list[str], revote: bool) -> dict[str, str]:
            votes: dict[str, str] = {}
            for v in voters:
                player = self.by_name[v]
                options = [c for c in eligible if c != v] or eligible
                state = self.base_state(player)
                state.update(candidates=options, revote=revote)
                parsed = self.ask(player, "vote", prompts.vote_instruction(state), state, {"candidates": options})
                self.apply_notes(player, parsed)
                target = (parsed or {}).get("vote")
                valid = target in options
                if not valid:
                    target = self.rng.choice(options)
                    self.log.emit("invalid_vote", round=self.round, voter=v, got=(parsed or {}).get("vote"), assigned=target)
                votes[v] = target
                self.log.emit("vote", round=self.round, voter=v, target=target, revote=revote)
            return votes

        first = ballot(candidates, revote=False)
        outcome = resolve_council(first, lambda tied: ballot(tied, revote=True), self.round_scores, self.rng)
        self.eliminate(outcome.eliminated, outcome)

    def eliminate(self, name: str, outcome: CouncilOutcome) -> None:
        self.log.emit("council_result", round=self.round, eliminated=name, method=outcome.method, tied=outcome.tied, ballots=outcome.ballots)
        p = self.by_name[name]
        p.alive = False
        p.placement = len([q for q in self.players if q.alive]) + 1
        self.eliminated.append(name)
        self.social.remove_player(name)
        joins_jury = self.cfg.jury == "all" or self.merged
        if joins_jury:
            self.jury.append(name)
        self.log.emit("elimination", round=self.round, player=name, placement=p.placement, jury=joins_jury, remaining=self.alive_names())

    # ----- finale --------------------------------------------------------
    def finale(self) -> None:
        finalists = self.alive_names()
        jurors = list(self.jury)
        self.log.emit("finale_start", round=self.round, finalists=finalists, jury=jurors)
        self.social.add_channel("jury", "public", [*finalists, *jurors])
        for name in finalists:
            player = self.by_name[name]
            state = self.base_state(player)
            parsed = self.ask(player, "plea", prompts.plea_instruction(state), state, {})
            text = str((parsed or {}).get("text", "")).strip() or f"{name} rests their case."
            m = self.social.post(self.round, "jury", name, text)
            self.log.emit("plea", round=self.round, message_seq=m.seq, player=name, text=text)
        votes: dict[str, str] = {}
        for j in jurors:
            juror = self.by_name[j]
            state = self.base_state(juror)
            state.update(candidates=finalists)
            parsed = self.ask(juror, "jury", prompts.jury_instruction(state), state, {"candidates": finalists})
            target = (parsed or {}).get("vote")
            if target not in finalists:
                target = self.rng.choice(finalists)
                self.log.emit("invalid_vote", round=self.round, voter=j, got=(parsed or {}).get("vote"), assigned=target)
            votes[j] = target
            self.log.emit("jury_vote", round=self.round, voter=j, target=target)
        counts = {f: sum(1 for t in votes.values() if t == f) for f in finalists}
        ranked = sorted(finalists, key=lambda f: (-counts[f], -self.by_name[f].total_score, self.rng.random()))
        for i, f in enumerate(ranked):
            self.by_name[f].placement = i + 1
            self.by_name[f].alive = f == ranked[0]
        self.winner = ranked[0]
        method = "jury_plurality" if len(set(counts.values())) > 1 or len(finalists) == 1 else "jury_tie_total_score"
        self.log.emit("winner", round=self.round, player=self.winner, votes=votes, counts=counts, method=method, placements=self.placements())

    def placements(self) -> dict[str, int]:
        return {p.name: p.placement for p in self.players if p.placement is not None}

    def summary(self) -> dict[str, Any]:
        return {
            "season_id": self.cfg.season_id,
            "winner": self.winner,
            "placements": self.placements(),
            "models": {p.name: p.model for p in self.players},
            "rounds": self.round,
            "budget": self.budget.snapshot(),
        }


def run_season(cfg: SeasonConfig, log_path: str | Path | None = None, client: ModelClient | None = None, **pools: Any) -> dict[str, Any]:
    log = EventLog(log_path)
    return Season(cfg, client=client, log=log, **pools).run()
