# SlopLabel exports

Full dumps of the team's SlopLabel annotation database (slop-only labels on the 30 mirrored Design Arena sites, S01–S30).

| File | What |
| --- | --- |
| `sloplabel-<ts>.json` | `{"exported_at", "sites", "labels"}`; one object per label with site, annotator, comment, page path, viewport, source loc / component chain, CSS selector, text, bbox (`rect`), computed `styles`, outer `html`, screenshot paths. |
| `sloplabel-<ts>.csv` | Same labels, flattened. |
| `sloplabel-<ts>.db` | Raw SQLite file (tables `sites`, `labels`). |
| `shots/<id>.png`, `shots/<id>_ctx.png` | Element crop and red-outline context screenshot for label `<id>`, one pair per label (357 labels → 714 files). `shot_path` / `ctx_path` in the exports point at `/home/ubuntu/slopbench/sloplabel/data/shots/…` on the labeling VM; map the basename to this folder. `shot_status` is `ok` (element located and cropped; 320 labels) or `approx` (element not re-found at capture time, so the crop is the label's recorded bounding box; 37 labels, mostly S30 and S13). |

Every label means "slop". There is no not-slop / unsure verdict, no severity and no manual tags (`verdict` is always `slop` for schema compatibility; `tags` / `severity` are legacy nulls). Comments are optional. The 2026-11-15T0713Z export has 357 labels (236 with comments) on 12 sites: S01–S06, S09, S12, S13, S14, S25, S30; annotators katie 130, Ali 128, Aidan 99.

The tool itself is in `tools/sloplabel/` (FastAPI + SQLite + plain-JS overlay); see its README for running it against the site mirrors.

`S13-ref` (label ids 461–480, annotator katie, tag `chat`) holds Katie's chat critiques of the S13 golden-reference rebuild (`references/S13/`), kept apart from the original S13/S14 labels. Their crops were captured from the rebuild at commit 15b83be, the state she critiqued; `shot_path` for these is relative to this folder. R16–R20 (overscroll, hero load, polish, palette, side padding) have no crop.
