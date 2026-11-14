from __future__ import annotations

import argparse
import json
import os
from pathlib import Path

from .config import load_config
from .elo import leaderboard, update_from_placements
from .engine import run_season
from .replay import rebuild, recap
from .events import EventLog


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="tbi", description="Total Benchmark Island")
    sub = ap.add_subparsers(dest="cmd", required=True)

    r = sub.add_parser("run", help="play a season")
    r.add_argument("config")
    r.add_argument("--out", default=None, help="JSONL event log path (default runs/<season_id>.jsonl)")
    r.add_argument("--seed", type=int, default=None)

    rc = sub.add_parser("recap", help="summarize an event log")
    rc.add_argument("log")

    el = sub.add_parser("elo", help="Elo leaderboard across season logs")
    el.add_argument("logs", nargs="+")
    el.add_argument("--k", type=float, default=32.0)

    hb = sub.add_parser("hub", help="serve the game-master hub (season engine + message broker)")
    hb.add_argument("--host", default="0.0.0.0")
    hb.add_argument("--port", type=int, default=8000)
    hb.add_argument("--admin-key", default=os.environ.get("TBI_ADMIN_KEY"))
    hb.add_argument("--log-dir", default="runs")

    sc = sub.add_parser("season-create", help="register a season on a running hub")
    sc.add_argument("config")
    sc.add_argument("--hub", required=True)
    sc.add_argument("--admin-key", default=os.environ.get("TBI_ADMIN_KEY"))
    sc.add_argument("--join-token", default=os.environ.get("TBI_JOIN_TOKEN"))
    sc.add_argument("--turn-timeout", type=float, default=240.0)
    sc.add_argument("--start-mode", choices=["all_registered", "manual"], default="all_registered")

    hd = sub.add_parser("harbor-dataset", help="write a Harbor dataset (one task per contestant) for Valkyrie")
    hd.add_argument("config")
    hd.add_argument("--hub", required=True, help="public hub URL the sandboxes will reach")
    hd.add_argument("--out", required=True)
    hd.add_argument("--agent-timeout", type=int, default=6 * 3600)

    fe = sub.add_parser("fetch-log", help="download a season's event log from a hub")
    fe.add_argument("--hub", required=True)
    fe.add_argument("season_id")
    fe.add_argument("--out", default=None)

    args = ap.parse_args(argv)
    if args.cmd == "run":
        cfg = load_config(args.config)
        if args.seed is not None:
            cfg.seed = args.seed
        out = Path(args.out) if args.out else Path("runs") / f"{cfg.season_id}.jsonl"
        out.parent.mkdir(parents=True, exist_ok=True)
        if out.exists():
            out.unlink()
        summary = run_season(cfg, out)
        print(json.dumps(summary, indent=2))
        print(f"log: {out}")
    elif args.cmd == "recap":
        print(recap(args.log))
    elif args.cmd == "hub":
        from .hub import serve

        serve(host=args.host, port=args.port, admin_key=args.admin_key, log_dir=args.log_dir)
    elif args.cmd == "season-create":
        import httpx
        import yaml

        from .harbor import season_request

        raw = yaml.safe_load(Path(args.config).read_text())
        body = season_request(raw, args.join_token, args.turn_timeout)
        body["start_mode"] = args.start_mode
        r = httpx.post(f"{args.hub.rstrip('/')}/seasons", json=body, headers={"X-Admin-Key": args.admin_key or ""}, timeout=60)
        r.raise_for_status()
        data = r.json()
        print(json.dumps({k: data[k] for k in ("season_id", "players")}, indent=2))
        print("join token (store as the Valkyrie secret tbi-join-token):", data["join_token"])
    elif args.cmd == "harbor-dataset":
        from .harbor import write_dataset

        cfg = load_config(args.config)
        paths = write_dataset(cfg, args.out, args.hub, agent_timeout_sec=args.agent_timeout)
        print(f"wrote {len(paths)} tasks to {args.out}")
        print(f"push: valkyrie dataset push tbi/{cfg.season_id} {args.out} --tag v1")
    elif args.cmd == "fetch-log":
        import httpx

        out = Path(args.out or f"runs/{args.season_id}.jsonl")
        out.parent.mkdir(parents=True, exist_ok=True)
        since, n = 0, 0
        with out.open("w") as fh:
            while True:
                page = httpx.get(f"{args.hub.rstrip('/')}/seasons/{args.season_id}/events", params={"since": since, "limit": 1000}, timeout=60).json()
                for e in page["events"]:
                    fh.write(json.dumps(e, sort_keys=True) + "\n")
                    n += 1
                if not page["events"]:
                    break
                since = page["next"]
        print(f"wrote {n} events to {out} (season status: {page['status']})")
    elif args.cmd == "elo":
        ratings: dict[str, float] = {}
        for path in args.logs:
            s = rebuild(EventLog.read(path))
            if not s["winner"]:
                print(f"skipping unfinished season {path}")
                continue
            ratings = update_from_placements(ratings, s["placements"], s["players"], k=args.k)
        for i, (m, r) in enumerate(leaderboard(ratings), 1):
            print(f"{i:>2}. {m:<40} {r:7.1f}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
