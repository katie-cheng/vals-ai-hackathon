"""Dump arena sites, votes and screenshot crops for the slop model.

Crops per site: first 3 desktop viewports (1000x625 from the 1000px-wide cached WebP) + first mobile viewport.
Writes data/models/crops.pkl ({site_id: [jpeg bytes, ...]}) and data/models/dataset.json (sites + votes).
"""
import io, json, pathlib, pickle, sys, time

ROOT = pathlib.Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "arena"))
import app  # noqa: E402
from PIL import Image  # noqa: E402

OUT = ROOT / "data/models"
VIEWS = [("desktop", 0, 625), ("desktop", 625, 625), ("desktop", 1250, 625), ("mobile", 0, 844)]


def crops(s):
    out = []
    for view, top, h in VIEWS:
        try:
            p = app.compressed_shot(s, view)
        except OSError:  # cache race with the arena's warm-cache thread; its file is there by now
            time.sleep(2)
            p = app.compressed_shot(s, view)
        if not p:
            continue
        im = Image.open(p).convert("RGB")
        if top and im.height < top + h // 2:
            continue
        tile = im.crop((0, top, im.width, min(im.height, top + h)))
        b = io.BytesIO()
        tile.save(b, "JPEG", quality=90)
        out.append(b.getvalue())
    return out


def main():
    app.warm_cache = lambda: None
    with app.app.app_context():
        S = app.live_sites()
        votes = [dict(r) for r in app.db().execute("SELECT * FROM votes WHERE choice != 'skip' ORDER BY id")
                 if r["left_id"] in S and r["right_id"] in S]
        voted = {v[k] for v in votes for k in ("left_id", "right_id")}
        sites = {k: {f: s.get(f) for f in ("id", "kind", "split", "model", "group", "url")} for k, s in S.items()}
        data = {}
        for i, k in enumerate(sorted(S)):
            data[k] = crops(S[k])
            if i % 50 == 0:
                print(i, len(S), flush=True)
    OUT.mkdir(parents=True, exist_ok=True)
    pickle.dump(data, open(OUT / "crops.pkl", "wb"))
    json.dump({"sites": sites, "votes": votes}, open(OUT / "dataset.json", "w"))
    print(f"{len(sites)} sites ({len(voted)} with votes), {len(votes)} votes, {sum(map(len, data.values()))} crops")


if __name__ == "__main__":
    main()
