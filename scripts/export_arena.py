"""Dump the Slop Arena database into data/arena/ for the repo.

Writes arena-<ts>.json (every vote, including votes on sites later removed, plus the removed list and
site metadata), arena-<ts>.csv (votes, flattened) and arena-<ts>.db (SQLite copy). The arena DB path
follows arena/app.py (ARENA_DB or ~/slopbench-arena-data/arena.db).
"""
import csv, json, pathlib, sqlite3, sys, time

ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "arena"))
import app  # noqa: E402

out = ROOT / "data/arena"
out.mkdir(parents=True, exist_ok=True)
ts = time.strftime("%Y-%m-%dT%H%MZ", time.gmtime())
src = sqlite3.connect(app.DB)
src.row_factory = sqlite3.Row

dst = sqlite3.connect(out / f"arena-{ts}.db")
src.backup(dst)
dst.close()

votes = [dict(r) for r in src.execute("SELECT * FROM votes ORDER BY id")]
removed = [dict(r) for r in src.execute("SELECT * FROM removed ORDER BY site_id")]
sites = {k: {f: v for f, v in s.items() if f not in ("dir", "prompt")} for k, s in app.sites().items()}
json.dump({"exported_at": ts, "sites": sites, "votes": votes, "removed": removed},
          open(out / f"arena-{ts}.json", "w"), indent=1)
with open(out / f"arena-{ts}.csv", "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=list(votes[0]))
    w.writeheader()
    w.writerows(votes)
print(f"arena-{ts}: {len(votes)} votes, {len(removed)} removed, {len(sites)} sites")
