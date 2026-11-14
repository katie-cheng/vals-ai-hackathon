from __future__ import annotations

from collections import Counter
from pathlib import Path
from typing import Any

from .events import EventLog


def rebuild(events: list[dict[str, Any]]) -> dict[str, Any]:
    """Reconstruct season state purely from the event log."""
    state: dict[str, Any] = {
        "season_id": None,
        "players": {},
        "tribes": {},
        "rounds": [],
        "eliminated": [],
        "placements": {},
        "winner": None,
        "messages": 0,
        "cost_usd": 0.0,
        "finished": False,
    }
    current: dict[str, Any] | None = None
    for e in events:
        t = e["type"]
        if t == "season_start":
            state["season_id"] = e["season_id"]
            state["players"] = {p["name"]: p["model"] for p in e["players"]}
            state["tribes"] = e["tribes"]
        elif t == "round_start":
            current = {"round": e["round"], "stage": e["stage"], "votes": [], "eliminated": None}
            state["rounds"].append(current)
        elif t == "challenge_draw" and current is not None:
            current["challenge"] = e["challenge"]
            current["items"] = e["items"]
        elif t == "challenge_scores" and current is not None:
            current["scores"] = e["scores"]
            current["group_scores"] = e.get("group_scores")
        elif t == "immunity" and current is not None:
            current["immune"] = e["immune"]
        elif t == "message":
            state["messages"] += 1
        elif t == "council_result" and current is not None:
            current["votes"] = e["ballots"]
            current["method"] = e["method"]
        elif t == "elimination":
            state["eliminated"].append(e["player"])
            state["placements"][e["player"]] = e["placement"]
            if current is not None:
                current["eliminated"] = e["player"]
        elif t == "winner":
            state["winner"] = e["player"]
            state["placements"].update(e["placements"])
        elif t == "model_call":
            state["cost_usd"] += e.get("cost_usd", 0.0)
        elif t == "season_end":
            state["finished"] = True
    return state


def recap(path: str | Path) -> str:
    events = EventLog.read(path)
    s = rebuild(events)
    out = [f"Season {s['season_id']}: {len(s['players'])} players, {len(s['rounds'])} rounds, {s['messages']} messages, ${s['cost_usd']:.4f}"]
    out.append("Tribes: " + "; ".join(f"{t}: {', '.join(m)}" for t, m in s["tribes"].items()))
    for r in s["rounds"]:
        line = f"R{r['round']:>2} [{r['stage']}] {r.get('challenge','?')}: immune={','.join(r.get('immune', []))}"
        if r.get("votes"):
            final = Counter(r["votes"][-1].values())
            line += f" | votes={dict(final)} ({r.get('method')})"
        if r.get("eliminated"):
            line += f" -> OUT: {r['eliminated']}"
        out.append(line)
    if s["winner"]:
        out.append(f"WINNER: {s['winner']}")
        order = sorted(s["placements"].items(), key=lambda kv: kv[1])
        out.append("Placements: " + ", ".join(f"{p}#{n}" for p, n in order))
    else:
        out.append("(season did not finish)")
    return "\n".join(out)
