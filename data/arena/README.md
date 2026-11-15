# Slop Arena vote exports

Snapshots of the Slop Arena database (`arena/app.py`), written by `python3 scripts/export_arena.py` on the VM serving the arena. Rerun and commit after voting sessions; the newest timestamp is current.

| File | What |
| --- | --- |
| `arena-<ts>.json` | `{"exported_at", "sites", "votes", "removed"}`. `votes` is every vote ever cast, including votes on sites later removed (the live `/api/export` drops those). `sites` is the arena's site registry (id, kind, split, group, model, url, ...). |
| `arena-<ts>.csv` | `votes`, flattened. |
| `arena-<ts>.db` | Raw SQLite copy (tables `votes`, `removed`). |

Vote fields: `voter`, `left_id`, `right_id`, `category` (`test` = frozen test-set pair, otherwise the picker category), `view`, `choice`, `ms` (time to vote), `created_at` (Unix seconds). `choice` is which side is sloppier: `left` / `right`; `both`, `neither` and the legacy `same` are ties; `skip` means no judgment. `removed` lists sites someone marked "Stop showing" (bot-check pages, 404s, blank pages); exclude them from analysis.

The screenshots the arena shows are not committed (several GB): `data/snapshots/` is git-ignored except held-out sites, and `scripts/scrape_*.py` / `scripts/snapshot_sites.py` regenerate them.
