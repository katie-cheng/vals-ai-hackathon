from __future__ import annotations

import argparse
import json
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
