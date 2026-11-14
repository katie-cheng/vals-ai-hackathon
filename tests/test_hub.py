import socket
import threading
import time

import httpx
import pytest
import uvicorn

from tbi.agent import ContestantAgent, HubConnection, MockPolicy
from tbi.hub import Hub, create_app

from conftest import make_cfg


def free_port() -> int:
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


@pytest.fixture
def hub_server(tmp_path):
    hub = Hub(admin_key="adm", log_dir=tmp_path / "runs")
    port = free_port()
    server = uvicorn.Server(uvicorn.Config(create_app(hub), host="127.0.0.1", port=port, log_level="warning"))
    t = threading.Thread(target=server.run, daemon=True)
    t.start()
    for _ in range(100):
        if server.started:
            break
        time.sleep(0.05)
    yield hub, f"http://127.0.0.1:{port}"
    server.should_exit = True
    t.join(timeout=5)


def raw_cfg(n=6, **over):
    cfg = make_cfg(n, merge_at=4, social_turns=1, **over)
    return {
        "season_id": cfg.season_id,
        "seed": cfg.seed,
        "players": [{"name": p.name, "model": p.model} for p in cfg.players],
        "num_tribes": 2,
        "merge_at": 4,
        "finale_at": 2,
        "social_turns": 1,
        "items_per_challenge": 5,
        "cost_cap_usd": 10.0,
        "tribe_pool": [{"type": "mock", "name": f"t{i}", "num_items": 40} for i in range(4)],
        "individual_pool": [{"type": "mock", "name": f"i{i}", "num_items": 40} for i in range(4)],
    }


def run_agents(url, sid, players, join, out, skip=()):
    agents, threads = [], []
    for i, name in enumerate(players):
        if name in skip:
            continue
        a = ContestantAgent(HubConnection(url, sid, name, join), MockPolicy(seed=i), out_dir=out / name)
        agents.append(a)
        th = threading.Thread(target=a.run, kwargs={"max_idle_s": 60}, daemon=True)
        th.start()
        threads.append(th)
    return agents, threads


def test_full_season_over_hub_with_remote_mock_agents(hub_server, tmp_path):
    hub, url = hub_server
    r = httpx.post(f"{url}/seasons", json={"config": raw_cfg(), "turn_timeout": 30}, headers={"X-Admin-Key": "adm"})
    assert r.status_code == 201, r.text
    sid, join, players = r.json()["season_id"], r.json()["join_token"], r.json()["players"]

    agents, threads = run_agents(url, sid, players, join, tmp_path)
    rt = hub.seasons[sid]
    for th in threads:
        th.join(timeout=120)
    assert rt.wait(5)
    state = httpx.get(f"{url}/seasons/{sid}").json()
    assert state["status"] == "finished" and state["winner"] in players
    assert all(a.result and a.turns > 0 for a in agents)

    pl = httpx.get(f"{url}/seasons/{sid}/placements/{state['winner']}").json()
    assert pl["placement"] == 1 and pl["reward"] == 1.0
    worst = min(state["placements"], key=lambda n: -state["placements"][n])
    assert httpx.get(f"{url}/seasons/{sid}/placements/{worst}").json()["reward"] == 0.0

    evs = httpx.get(f"{url}/seasons/{sid}/events", params={"since": 0, "limit": 5000}).json()["events"]
    assert any(e["type"] == "message" for e in evs) and evs[-1]["type"] == "season_end"
    assert not any(e["type"] == "turn_timeout" for e in evs)
    # agents kept their own notes and saw messages addressed to them
    assert any((tmp_path / a.conn.player / "notes.md").exists() for a in agents)
    assert any("message" in (tmp_path / a.conn.player / "transcript.jsonl").read_text() for a in agents)
    assert (tmp_path / "runs" / f"{sid}.jsonl").exists()


def test_missing_agent_times_out_and_season_still_finishes(hub_server, tmp_path):
    hub, url = hub_server
    cfg = raw_cfg()
    cfg["season_id"] = "ghost"
    r = httpx.post(f"{url}/seasons", json={"config": cfg, "turn_timeout": 0.3, "start_mode": "manual"}, headers={"X-Admin-Key": "adm"})
    sid, join, players = r.json()["season_id"], r.json()["join_token"], r.json()["players"]
    ghost = players[0]
    agents, threads = run_agents(url, sid, players, join, tmp_path, skip={ghost})
    # ghost registers but never answers
    httpx.post(f"{url}/seasons/{sid}/nodes/{ghost}/register", json={"join_token": join}).raise_for_status()
    httpx.post(f"{url}/seasons/{sid}/start", headers={"X-Admin-Key": "adm"}).raise_for_status()
    rt = hub.seasons[sid]
    assert rt.wait(120)
    for th in threads:
        th.join(timeout=30)
    assert rt.status == "finished"
    assert any(e["type"] == "turn_timeout" and e["player"] == ghost for e in rt.log.events)


def test_node_auth_and_join_token(hub_server):
    hub, url = hub_server
    cfg = raw_cfg()
    cfg["season_id"] = "auth"
    r = httpx.post(f"{url}/seasons", json={"config": cfg, "join_token": "secret", "start_mode": "manual"}, headers={"X-Admin-Key": "adm"})
    assert r.status_code == 201
    assert httpx.post(f"{url}/seasons", json={"config": cfg}, headers={"X-Admin-Key": "nope"}).status_code == 401
    assert httpx.post(f"{url}/seasons/auth/nodes/Ada/register", json={"join_token": "wrong"}).status_code == 401
    assert httpx.post(f"{url}/seasons/auth/nodes/Nobody/register", json={"join_token": "secret"}).status_code == 404
    tok = httpx.post(f"{url}/seasons/auth/nodes/Ada/register", json={"join_token": "secret"}).json()["node_token"]
    assert httpx.get(f"{url}/seasons/auth/nodes/Ada/inbox", params={"wait": 0}, headers={"X-Node-Token": "bad"}).status_code == 401
    assert httpx.get(f"{url}/seasons/auth/nodes/Ada/inbox", params={"wait": 0}, headers={"X-Node-Token": tok}).json()["items"] == []
    assert httpx.get(f"{url}/seasons/auth/placements/Ada").status_code == 409
    # acting without an open turn is rejected, as is sending outside your turn
    h = {"X-Node-Token": tok}
    assert httpx.post(f"{url}/seasons/auth/nodes/Ada/act", json={"turn_id": "x", "text": "{}"}, headers=h).status_code == 409
    assert httpx.post(f"{url}/seasons/auth/nodes/Ada/send", json={"text": "hi"}, headers=h).status_code == 409


def test_send_during_open_social_turn_counts_as_the_action(hub_server, tmp_path):
    hub, url = hub_server
    cfg = raw_cfg()
    cfg["season_id"] = "send"
    r = httpx.post(f"{url}/seasons", json={"config": cfg, "join_token": "j", "turn_timeout": 30}, headers={"X-Admin-Key": "adm"})
    sid, players = r.json()["season_id"], r.json()["players"]
    speaker = players[0]
    agents, threads = run_agents(url, sid, players, "j", tmp_path, skip={speaker})
    conn = HubConnection(url, sid, speaker, "j")
    conn.register()
    rt = hub.seasons[sid]
    said = 0
    while rt.status in ("waiting", "running"):
        items = conn.inbox(wait=5).get("items", [])
        for item in items:
            if item.get("type") != "turn_request":
                continue
            if item["kind"] == "social":
                conn.send(f"hello from {speaker}")
                said += 1
            else:
                cands = item["meta"].get("candidates") or ["?"]
                from tbi.models import Completion
                import json as _json

                conn.act(item["turn_id"], Completion(text=_json.dumps({"vote": cands[0], "text": "pick me"})))
        if rt.status not in ("waiting", "running"):
            break
    assert rt.wait(60)
    for th in threads:
        th.join(timeout=30)
    assert said >= 1
    assert any(e["type"] == "message" and e["sender"] == speaker and e["text"].startswith("hello from") for e in rt.log.events)
