"""Game-master hub: runs the season engine and brokers messages between contestant nodes.

Each contestant runs in its own sandbox and talks to the hub over HTTP:
  register -> inbox (long-poll for turn requests and messages) -> act.
The engine never changes: `HubClient` is a `ModelClient` whose `complete()` parks the
request on the player's node and waits for the agent's reply.
"""

from __future__ import annotations

import json
import secrets
import threading
import time
import uuid
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from .config import SeasonConfig, config_from_dict
from .engine import Season
from .events import EventLog
from .models import Completion, ModelRequest


@dataclass
class Node:
    player: str
    token: str | None = None
    inbox: list[dict[str, Any]] = field(default_factory=list)
    open_turn: dict[str, Any] | None = None
    replies: dict[str, dict[str, Any]] = field(default_factory=dict)
    last_seen: float = 0.0
    registered_at: float | None = None


class SeasonRuntime:
    """One season: engine thread + per-player nodes guarded by a single condition variable."""

    def __init__(
        self,
        cfg: SeasonConfig,
        log_path: str | Path | None = None,
        join_token: str | None = None,
        turn_timeout: float = 240.0,
        start_mode: str = "all_registered",
        free_chat: bool = False,
    ):
        self.cfg = cfg
        self.join_token = join_token
        self.turn_timeout = turn_timeout
        self.start_mode = start_mode
        self.free_chat = free_chat
        self.nodes = {p.name: Node(p.name) for p in cfg.players}
        self.cv = threading.Condition()
        self.log = EventLog(log_path)
        self.log.subscribe(self._on_event)
        self.season = Season(cfg, client=HubClient(self), log=self.log)
        self.status = "waiting"
        self.error: str | None = None
        self.summary: dict[str, Any] | None = None
        self.thread: threading.Thread | None = None

    # ----- registration / lifecycle --------------------------------------
    def register(self, player: str, join_token: str | None) -> dict[str, Any]:
        if player not in self.nodes:
            raise KeyError(player)
        if self.join_token and join_token != self.join_token:
            raise PermissionError("bad join token")
        with self.cv:
            node = self.nodes[player]
            node.token = secrets.token_urlsafe(24)
            node.registered_at = node.last_seen = time.time()
            self.cv.notify_all()
        self.log.emit("node_registered", player=player)
        if self.start_mode == "all_registered" and self.all_registered():
            self.start()
        model = self.season.by_name[player].model
        return {"node_token": node.token, "player": player, "model": model, "season_id": self.cfg.season_id}

    def all_registered(self) -> bool:
        return all(n.token for n in self.nodes.values())

    def start(self) -> None:
        with self.cv:
            if self.thread is not None:
                return
            self.status = "running"
            self.thread = threading.Thread(target=self._run, name=f"season-{self.cfg.season_id}", daemon=True)
            self.thread.start()

    def _run(self) -> None:
        try:
            self.summary = self.season.run()
            end = next((e for e in reversed(self.log.events) if e["type"] == "season_end"), None)
            self.status = end["status"] if end else "finished"
        except Exception as e:  # noqa: BLE001 - surface engine failures to the API instead of dying silently
            self.error = f"{type(e).__name__}: {e}"
            self.status = "error"
            try:
                self.log.emit("season_error", error=self.error)
            finally:
                self.log.close()
        with self.cv:
            for n in self.nodes.values():
                n.inbox.append({"type": "season_end", "status": self.status, "winner": self.season.winner, "placements": self.season.placements()})
            self.cv.notify_all()

    def wait(self, timeout: float | None = None) -> bool:
        if self.thread is None:
            return False
        self.thread.join(timeout)
        return not self.thread.is_alive()

    # ----- event fan-out -------------------------------------------------
    def _on_event(self, event: dict[str, Any]) -> None:
        t = event["type"]
        if t == "message":
            item = {k: event[k] for k in ("round", "channel", "kind", "sender", "text", "message_seq")}
            item["type"] = "message"
            with self.cv:
                for r in event["recipients"]:
                    if r != event["sender"] and r in self.nodes:
                        self.nodes[r].inbox.append(item)
                self.cv.notify_all()
        elif t == "elimination":
            with self.cv:
                self.nodes[event["player"]].inbox.append({"type": "eliminated", "round": event["round"], "placement": event["placement"], "jury": event["jury"]})
                self.cv.notify_all()

    # ----- node plumbing -------------------------------------------------
    def auth(self, player: str, token: str | None) -> Node:
        node = self.nodes.get(player)
        if node is None or node.token is None or token != node.token:
            raise PermissionError("bad node token")
        node.last_seen = time.time()
        return node

    def request_turn(self, player: str, payload: dict[str, Any]) -> dict[str, Any] | None:
        node = self.nodes[player]
        turn_id = payload["turn_id"]
        deadline = time.monotonic() + self.turn_timeout
        with self.cv:
            node.open_turn = payload
            node.inbox.append(payload)
            self.cv.notify_all()
            while turn_id not in node.replies:
                remaining = deadline - time.monotonic()
                if remaining <= 0:
                    break
                self.cv.wait(remaining)
            node.open_turn = None
            return node.replies.pop(turn_id, None)

    def deliver_reply(self, player: str, turn_id: str, reply: dict[str, Any]) -> None:
        node = self.nodes[player]
        with self.cv:
            if not node.open_turn or node.open_turn["turn_id"] != turn_id:
                raise LookupError("no such open turn")
            node.replies[turn_id] = reply
            self.cv.notify_all()

    def pop_inbox(self, player: str, wait: float) -> list[dict[str, Any]]:
        node = self.nodes[player]
        deadline = time.monotonic() + wait
        with self.cv:
            while not node.inbox:
                remaining = deadline - time.monotonic()
                if remaining <= 0:
                    return []
                self.cv.wait(remaining)
            items, node.inbox = node.inbox, []
            return items

    def send(self, player: str, text: str, channel: str | None = None, to: str | None = None) -> dict[str, Any]:
        """Out-of-turn send. Consumes the player's open social turn unless free_chat is on."""
        node = self.nodes[player]
        if to:
            action = {"action": "dm", "to": to, "text": text}
        elif channel and channel.startswith("group:"):
            action = {"action": "group", "group": channel, "text": text}
        else:
            action = {"action": "channel", "text": text}
        if node.open_turn and node.open_turn["kind"] == "social":
            self.deliver_reply(player, node.open_turn["turn_id"], {"text": json.dumps(action), "action": action})
            return {"delivered": "turn", "action": action}
        if not self.free_chat:
            raise PermissionError("no open social turn; wait for your turn")
        social = self.season.social
        if to:
            ch = social.ensure_dm(player, to)
            cid = ch.id
        else:
            cid = channel or self.season.default_channel(self.season.by_name[player])
        m = social.post(self.season.round, cid, player, text)
        chan = social.channels[cid]
        self.log.emit("message", round=self.season.round, turn=0, message_seq=m.seq, channel=cid, kind=chan.kind, sender=player, recipients=sorted(chan.members), text=text)
        return {"delivered": "free_chat", "action": action}

    # ----- read-only views -----------------------------------------------
    def visible(self, player: str, since: int = 0) -> dict[str, Any]:
        s = self.season.social
        return {
            "channels": [{"id": c.id, "kind": c.kind, "members": sorted(c.members)} for c in s.visible_channels(player)],
            "messages": [m.__dict__ for m in s.visible_messages(player) if m.seq > since],
        }

    def state(self) -> dict[str, Any]:
        s = self.season
        return {
            "season_id": self.cfg.season_id,
            "status": self.status,
            "error": self.error,
            "round": s.round,
            "stage": s.stage,
            "alive": s.alive_names(),
            "tribes": s.tribes(),
            "immune": s.immune,
            "eliminated": s.eliminated,
            "jury": s.jury,
            "winner": s.winner,
            "placements": s.placements(),
            "models": {p.name: p.model for p in s.players},
            "registered": sorted(n for n, node in self.nodes.items() if node.token),
            "waiting_on": [n for n, node in self.nodes.items() if node.open_turn],
            "events": len(self.log.events),
            "budget": s.budget.snapshot(),
        }

    def placement(self, player: str) -> dict[str, Any]:
        if self.status not in ("finished", "aborted", "error"):
            raise RuntimeError("season still running")
        p = self.season.by_name[player]
        n = len(self.season.players)
        if p.placement is None:
            raise RuntimeError("no placement recorded")
        reward = (n - p.placement) / (n - 1) if n > 1 else 1.0
        return {"player": player, "placement": p.placement, "players": n, "reward": round(reward, 6), "winner": self.season.winner, "status": self.status}


class HubClient:
    """ModelClient that delegates each request to the player's remote agent."""

    def __init__(self, runtime: SeasonRuntime):
        self.runtime = runtime

    def complete(self, request: ModelRequest) -> Completion:
        turn_id = uuid.uuid4().hex
        payload = {
            "type": "turn_request",
            "turn_id": turn_id,
            "kind": request.kind,
            "player": request.player,
            "model": request.model,
            "system": request.system,
            "notes": request.notes,
            "instruction": request.messages[-1]["content"] if request.messages else "",
            "meta": request.meta,
            "max_tokens": request.max_tokens,
            "params": request.params,
            "timeout": self.runtime.turn_timeout,
        }
        reply = self.runtime.request_turn(request.player, payload)
        if reply is None:
            self.runtime.log.emit("turn_timeout", round=self.runtime.season.round, player=request.player, kind=request.kind, turn_id=turn_id)
            return Completion(text="")
        text = reply.get("text") or ""
        if not text and isinstance(reply.get("action"), dict):
            text = json.dumps(reply["action"])
        return Completion(
            text=text,
            prompt_tokens=int(reply.get("prompt_tokens") or 0),
            completion_tokens=int(reply.get("completion_tokens") or 0),
            cost_usd=float(reply.get("cost_usd") or 0.0),
        )


class Hub:
    def __init__(self, admin_key: str | None = None, log_dir: str | Path = "runs"):
        self.admin_key = admin_key
        self.log_dir = Path(log_dir)
        self.seasons: dict[str, SeasonRuntime] = {}

    def create_season(self, raw: dict[str, Any], **opts: Any) -> SeasonRuntime:
        cfg = config_from_dict(raw)
        if cfg.season_id in self.seasons:
            raise KeyError(cfg.season_id)
        self.log_dir.mkdir(parents=True, exist_ok=True)
        rt = SeasonRuntime(cfg, self.log_dir / f"{cfg.season_id}.jsonl", **opts)
        self.seasons[cfg.season_id] = rt
        return rt


def create_app(hub: Hub):
    from fastapi import Body, FastAPI, Header, HTTPException, Query

    app = FastAPI(title="Total Benchmark Island hub")

    def season(sid: str) -> SeasonRuntime:
        rt = hub.seasons.get(sid)
        if rt is None:
            raise HTTPException(404, f"unknown season {sid}")
        return rt

    def admin(key: str | None) -> None:
        if hub.admin_key and key != hub.admin_key:
            raise HTTPException(401, "bad admin key")

    def node(rt: SeasonRuntime, player: str, token: str | None) -> Node:
        try:
            return rt.auth(player, token)
        except PermissionError as e:
            raise HTTPException(401, str(e))

    @app.get("/health")
    def health() -> dict[str, Any]:
        return {"ok": True, "seasons": len(hub.seasons)}

    @app.get("/seasons")
    def list_seasons() -> list[dict[str, Any]]:
        return [rt.state() for rt in hub.seasons.values()]

    @app.post("/seasons", status_code=201)
    def create(body: dict[str, Any] = Body(...), x_admin_key: str | None = Header(default=None)) -> dict[str, Any]:
        admin(x_admin_key)
        try:
            rt = hub.create_season(
                body["config"],
                join_token=body.get("join_token") or secrets.token_urlsafe(16),
                turn_timeout=float(body.get("turn_timeout", 240.0)),
                start_mode=body.get("start_mode", "all_registered"),
                free_chat=bool(body.get("free_chat", False)),
            )
        except KeyError as e:
            raise HTTPException(409, f"season exists: {e}")
        except (TypeError, ValueError) as e:
            raise HTTPException(422, f"bad config: {e}")
        return {"season_id": rt.cfg.season_id, "join_token": rt.join_token, "players": [p.name for p in rt.cfg.players], "state": rt.state()}

    @app.post("/seasons/{sid}/start")
    def start(sid: str, x_admin_key: str | None = Header(default=None)) -> dict[str, Any]:
        admin(x_admin_key)
        rt = season(sid)
        rt.start()
        return rt.state()

    @app.get("/seasons/{sid}")
    def get_state(sid: str) -> dict[str, Any]:
        return season(sid).state()

    @app.get("/seasons/{sid}/events")
    def events(sid: str, since: int = 0, limit: int = 1000) -> dict[str, Any]:
        rt = season(sid)
        evs = [e for e in rt.log.events if e["seq"] > since][:limit]
        return {"events": evs, "next": evs[-1]["seq"] if evs else since, "status": rt.status}

    @app.get("/seasons/{sid}/placements/{player}")
    def placement(sid: str, player: str) -> dict[str, Any]:
        rt = season(sid)
        if player not in rt.nodes:
            raise HTTPException(404, f"unknown player {player}")
        try:
            return rt.placement(player)
        except RuntimeError as e:
            raise HTTPException(409, str(e))

    @app.post("/seasons/{sid}/nodes/{player}/register")
    def register(sid: str, player: str, body: dict[str, Any] = Body(default={})) -> dict[str, Any]:
        rt = season(sid)
        try:
            return rt.register(player, body.get("join_token"))
        except KeyError:
            raise HTTPException(404, f"unknown player {player}")
        except PermissionError as e:
            raise HTTPException(401, str(e))

    @app.get("/seasons/{sid}/nodes/{player}/inbox")
    def inbox(sid: str, player: str, wait: float = Query(default=20.0, ge=0, le=30), x_node_token: str | None = Header(default=None)) -> dict[str, Any]:
        rt = season(sid)
        node(rt, player, x_node_token)
        return {"items": rt.pop_inbox(player, wait), "status": rt.status}

    @app.post("/seasons/{sid}/nodes/{player}/act")
    def act(sid: str, player: str, body: dict[str, Any] = Body(...), x_node_token: str | None = Header(default=None)) -> dict[str, Any]:
        rt = season(sid)
        node(rt, player, x_node_token)
        try:
            rt.deliver_reply(player, str(body.get("turn_id")), body)
        except LookupError as e:
            raise HTTPException(409, str(e))
        return {"ok": True}

    @app.post("/seasons/{sid}/nodes/{player}/send")
    def send(sid: str, player: str, body: dict[str, Any] = Body(...), x_node_token: str | None = Header(default=None)) -> dict[str, Any]:
        rt = season(sid)
        node(rt, player, x_node_token)
        try:
            return rt.send(player, str(body.get("text", "")), channel=body.get("channel"), to=body.get("to"))
        except PermissionError as e:
            raise HTTPException(409, str(e))
        except KeyError as e:
            raise HTTPException(404, f"unknown channel {e}")

    @app.get("/seasons/{sid}/nodes/{player}/messages")
    def messages(sid: str, player: str, since: int = 0, x_node_token: str | None = Header(default=None)) -> dict[str, Any]:
        rt = season(sid)
        node(rt, player, x_node_token)
        return rt.visible(player, since)

    return app


def serve(host: str = "0.0.0.0", port: int = 8000, admin_key: str | None = None, log_dir: str = "runs") -> None:
    import uvicorn

    uvicorn.run(create_app(Hub(admin_key=admin_key, log_dir=log_dir)), host=host, port=port, log_level="info")
