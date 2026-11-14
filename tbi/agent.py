"""Contestant agent: runs inside one sandbox, owns its private notes, talks to the hub.

The agent is policy-agnostic. `LLMPolicy` calls a model through the provider-agnostic
`ModelClient` layer; `MockPolicy` is deterministic. Write your own `Policy` to try a
different prompting or memory strategy without touching the game.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Protocol

import httpx

from .models import Completion, LiteLLMClient, MockModel, ModelClient, ModelRequest, extract_json


@dataclass
class Turn:
    turn_id: str
    kind: str
    player: str
    model: str
    system: str
    instruction: str
    notes: str = ""
    meta: dict[str, Any] = field(default_factory=dict)
    max_tokens: int = 400
    params: dict[str, Any] = field(default_factory=dict)
    timeout: float = 240.0

    @classmethod
    def from_item(cls, item: dict[str, Any]) -> "Turn":
        keys = {f for f in cls.__dataclass_fields__}
        return cls(**{k: v for k, v in item.items() if k in keys})


class Policy(Protocol):
    def decide(self, turn: Turn, notes: str) -> Completion: ...


class LLMPolicy:
    """Default policy: hub-provided prompt + the agent's own notes -> one model call."""

    def __init__(self, client: ModelClient | None = None, model_override: str | None = None):
        self.client = client or LiteLLMClient()
        self.model_override = model_override or None

    def decide(self, turn: Turn, notes: str) -> Completion:
        req = ModelRequest(
            player=turn.player,
            model=self.model_override or turn.model,
            system=turn.system,
            messages=[{"role": "user", "content": turn.instruction}],
            max_tokens=turn.max_tokens,
            kind=turn.kind,
            meta=turn.meta,
            params=turn.params,
            notes=notes,
        )
        return self.client.complete(req)


class MockPolicy(LLMPolicy):
    def __init__(self, seed: int = 0):
        super().__init__(client=MockModel(seed=seed))


class HubConnection:
    def __init__(self, hub_url: str, season: str, player: str, join_token: str | None = None, timeout: float = 60.0):
        self.base = hub_url.rstrip("/")
        self.season = season
        self.player = player
        self.join_token = join_token
        self.token: str | None = None
        self.http = httpx.Client(timeout=timeout)

    def _url(self, suffix: str) -> str:
        return f"{self.base}/seasons/{self.season}/nodes/{self.player}{suffix}"

    def _headers(self) -> dict[str, str]:
        return {"X-Node-Token": self.token or ""}

    def register(self) -> dict[str, Any]:
        r = self.http.post(self._url("/register"), json={"join_token": self.join_token})
        r.raise_for_status()
        data = r.json()
        self.token = data["node_token"]
        return data

    def inbox(self, wait: float = 20.0) -> dict[str, Any]:
        r = self.http.get(self._url("/inbox"), params={"wait": wait}, headers=self._headers())
        r.raise_for_status()
        return r.json()

    def act(self, turn_id: str, completion: Completion, action: dict[str, Any] | None = None) -> None:
        body = {
            "turn_id": turn_id,
            "text": completion.text,
            "action": action,
            "prompt_tokens": completion.prompt_tokens,
            "completion_tokens": completion.completion_tokens,
            "cost_usd": completion.cost_usd,
        }
        r = self.http.post(self._url("/act"), json=body, headers=self._headers())
        r.raise_for_status()

    def send(self, text: str, channel: str | None = None, to: str | None = None) -> dict[str, Any]:
        r = self.http.post(self._url("/send"), json={"text": text, "channel": channel, "to": to}, headers=self._headers())
        r.raise_for_status()
        return r.json()

    def messages(self, since: int = 0) -> dict[str, Any]:
        r = self.http.get(self._url("/messages"), params={"since": since}, headers=self._headers())
        r.raise_for_status()
        return r.json()


class ContestantAgent:
    def __init__(self, conn: HubConnection, policy: Policy, out_dir: str | Path = "tbi-agent", notes_chars: int = 2000):
        self.conn = conn
        self.policy = policy
        self.out = Path(out_dir)
        self.out.mkdir(parents=True, exist_ok=True)
        self.notes_path = self.out / "notes.md"
        self.transcript = self.out / "transcript.jsonl"
        self.notes_chars = notes_chars
        self.turns = 0
        self.errors = 0
        self.registration: dict[str, Any] | None = None
        self.result: dict[str, Any] | None = None

    @property
    def notes(self) -> str:
        return self.notes_path.read_text() if self.notes_path.exists() else ""

    def record(self, item: dict[str, Any]) -> None:
        with self.transcript.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps({"ts": time.time(), **item}, default=str) + "\n")

    def handle_turn(self, item: dict[str, Any]) -> None:
        turn = Turn.from_item(item)
        notes = self.notes or turn.notes
        try:
            completion = self.policy.decide(turn, notes)
        except Exception as e:  # noqa: BLE001 - never leave the hub waiting on a crashed policy
            self.errors += 1
            self.record({"type": "policy_error", "turn_id": turn.turn_id, "error": str(e)})
            completion = Completion(text="")
        parsed = extract_json(completion.text)
        if parsed and isinstance(parsed.get("notes"), str):
            self.notes_path.write_text(parsed["notes"][: self.notes_chars])
        self.conn.act(turn.turn_id, completion, parsed)
        self.turns += 1
        self.record({"type": "turn", "turn_id": turn.turn_id, "kind": turn.kind, "reply": completion.text})

    def run(self, max_idle_s: float | None = None) -> dict[str, Any]:
        self.registration = self._retry(self.conn.register)
        self.record({"type": "registered", **self.registration})
        idle_since = time.monotonic()
        backoff = 1.0
        while self.result is None:
            try:
                data = self.conn.inbox(wait=20.0)
                backoff = 1.0
            except httpx.HTTPError as e:
                self.errors += 1
                self.record({"type": "hub_error", "error": str(e)})
                time.sleep(backoff)
                backoff = min(backoff * 2, 30.0)
                if isinstance(e, httpx.HTTPStatusError) and e.response.status_code == 401:
                    self.registration = self._retry(self.conn.register)
                continue
            items = data.get("items", [])
            if items:
                idle_since = time.monotonic()
            for item in items:
                t = item.get("type")
                if t == "turn_request":
                    self.handle_turn(item)
                elif t == "message":
                    self.record(item)
                elif t == "eliminated":
                    self.record(item)
                    if not item.get("jury"):
                        self.result = {"status": "eliminated", **item}
                elif t == "season_end":
                    self.record(item)
                    self.result = {"status": item.get("status"), "winner": item.get("winner"), "placement": (item.get("placements") or {}).get(self.conn.player)}
            if data.get("status") in ("finished", "aborted", "error") and not items and self.result is None:
                self.result = {"status": data["status"]}
            if max_idle_s is not None and time.monotonic() - idle_since > max_idle_s:
                self.result = {"status": "idle_timeout"}
        summary = {"player": self.conn.player, "turns": self.turns, "errors": self.errors, **self.result}
        (self.out / "summary.json").write_text(json.dumps(summary, indent=2))
        return summary

    @staticmethod
    def _retry(fn, attempts: int = 30, delay: float = 2.0):
        last: Exception | None = None
        for _ in range(attempts):
            try:
                return fn()
            except httpx.HTTPError as e:
                last = e
                if isinstance(e, httpx.HTTPStatusError) and e.response.status_code in (401, 404):
                    raise
                time.sleep(delay)
        raise RuntimeError(f"hub unreachable: {last}")


def read_instruction(path: str | Path) -> dict[str, Any]:
    """Harbor instruction.md carries the hub coordinates in a ```json block."""
    text = Path(path).read_text()
    m = re.search(r"```json\s*(\{.*?\})\s*```", text, re.S)
    if not m:
        raise ValueError(f"no json block in {path}")
    return json.loads(m.group(1))


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="tbi-agent", description="Total Benchmark Island contestant")
    ap.add_argument("--instruction", help="Harbor instruction.md with a json block {hub, season, player}")
    ap.add_argument("--hub", default=os.environ.get("TBI_HUB_URL"))
    ap.add_argument("--season", default=os.environ.get("TBI_SEASON"))
    ap.add_argument("--player", default=os.environ.get("TBI_PLAYER"))
    ap.add_argument("--join-token", default=os.environ.get("TBI_JOIN_TOKEN"))
    ap.add_argument("--model", default="", help="override the model assigned by the season config")
    ap.add_argument("--policy", choices=["llm", "mock"], default="llm")
    ap.add_argument("--out", default=os.environ.get("TBI_AGENT_OUT", "tbi-agent"))
    ap.add_argument("--max-idle", type=float, default=None, help="exit after this many idle seconds")
    args = ap.parse_args(argv)

    coords: dict[str, Any] = {}
    if args.instruction:
        coords = read_instruction(args.instruction)
    hub = args.hub or coords.get("hub")
    season = args.season or coords.get("season")
    player = args.player or coords.get("player")
    join = args.join_token or coords.get("join_token")
    missing = [k for k, v in {"hub": hub, "season": season, "player": player}.items() if not v]
    if missing:
        ap.error(f"missing {missing}; pass flags, env, or --instruction")

    policy: Policy = MockPolicy(seed=hash(player) & 0xFFFF) if args.policy == "mock" else LLMPolicy(model_override=args.model or None)
    agent = ContestantAgent(HubConnection(hub, season, player, join), policy, out_dir=args.out)
    try:
        summary = agent.run(max_idle_s=args.max_idle)
    except Exception as e:  # noqa: BLE001 - report to Valkyrie, then fail the task
        err = os.environ.get("VALKYRIE_ERROR_PATH")
        if err:
            Path(err).write_text(f"AgentError: {e}\n")
        print(f"tbi-agent failed: {e}", file=sys.stderr)
        return 1
    print(json.dumps(summary))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
