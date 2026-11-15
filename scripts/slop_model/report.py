"""Visual report of the screenshot probe on the frozen held-out Design Arena sites.

Uses data/models/{dataset.json,emb.npz,crops.pkl,probe_w.npy} (probe_w is trained without held-out sites).
Writes a self-contained HTML file: every held-out pair with its human votes and the model's P(sloppier),
plus held-out sites ranked by model score and their percentile against the real-world reference pool.
Usage: python3 scripts/slop_model/report.py [out.html]
"""
import base64, collections, html, io, pathlib, pickle, sys

import numpy as np
from PIL import Image

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from train_probe import ROOT, TIE, load  # noqa: E402

REF = {"yc-pre2022", "yc-current"}
LABEL = {"left": "A sloppier", "right": "B sloppier", "both": "Both slop", "neither": "Neither slop", "same": "About the same"}


def thumb(jpeg, width):
    im = Image.open(io.BytesIO(jpeg)).convert("RGB")
    im = im.resize((width, round(im.height * width / im.width)))
    b = io.BytesIO()
    im.save(b, "JPEG", quality=72)
    return "data:image/jpeg;base64," + base64.b64encode(b.getvalue()).decode()


def main():
    out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else ROOT.parents[1] / "reports/heldout_predictions.html")
    sites, votes, F = load()
    w = np.load(ROOT / "probe_w.npy")
    crops = pickle.load(open(ROOT / "crops.pkl", "rb"))
    sc = {k: float(F[k] @ w) for k in F}
    ref = np.array([sc[k] for k in F if sites[k]["split"] in REF])
    pct = lambda k: 100 * np.mean(ref < sc[k])
    held = sorted(k for k in F if sites[k]["split"] == "heldout")

    pv = collections.defaultdict(list)
    for v in votes:
        a, b = v["left_id"], v["right_id"]
        if a in held and b in held:
            key = tuple(sorted((a, b)))
            c = v["choice"]
            if (a, b) != key:  # normalise to the sorted orientation
                c = {"left": "right", "right": "left"}.get(c, c)
            pv[key].append((v["voter"], c))

    tally = collections.defaultdict(lambda: [0, 0])
    for (a, b), vs in pv.items():
        for _, c in vs:
            if c in ("left", "right"):
                win = a if c == "left" else b
                tally[win][0] += 1
                tally[a][1] += 1; tally[b][1] += 1

    def card(k, big=True):
        c = crops.get(k, [])
        s = sites[k]
        imgs = "".join(f'<img src="{thumb(j, 420 if big else 260)}">' for j in c[:1])
        if len(c) > 1:
            imgs += f'<img class="mob" src="{thumb(c[-1], 130 if big else 80)}">'
        return (f'<div class="card"><div class="imgs">{imgs}</div><div class="meta"><b>{k}</b> · {html.escape(s["model"] or "")}'
                f' · score {sc[k]:+.2f} · sloppier than {pct(k):.0f}% of YC sites'
                f' · humans: sloppier in {tally[k][0]}/{tally[k][1]} held-out votes · <a href="{html.escape(s["url"] or "")}">live</a></div></div>')

    rows, hits = [], []
    for (a, b), vs in sorted(pv.items(), key=lambda x: -len(x[1])):
        gap = sc[a] - sc[b]
        pred = "A sloppier" if gap > 0 else "B sloppier"
        close = ", close call" if abs(gap) < 0.05 else ""
        res = []
        for voter, c in vs:
            if c in TIE:
                res.append(f'<span class="tie">{voter}: {LABEL[c]}</span>')
            else:
                ok = (c == "left") == (gap > 0)
                hits.append(ok)
                res.append(f'<span class="{"ok" if ok else "bad"}">{voter}: {LABEL[c]} {"✓" if ok else "✗"}</span>')
        rows.append(f'<section class="pair"><div class="ab"><div><h3>A</h3>{card(a)}</div><div><h3>B</h3>{card(b)}</div></div>'
                    f'<div class="verdict">Model: <b>{pred}</b> (score gap {abs(gap):.2f}{close}) &nbsp;|&nbsp; Humans: {" ".join(res)}</div></section>')

    ranked = sorted(held, key=lambda k: -sc[k])
    grid = "".join(f'<div class="rk"><div class="n">#{i + 1}</div>{card(k, big=False)}</div>' for i, k in enumerate(ranked))
    acc = f"{np.mean(hits):.0%} ({sum(hits)}/{len(hits)} side-picking votes)" if hits else "n/a"
    page = f"""<!doctype html><meta charset="utf-8"><title>Design Engineer Bench: held-out predictions</title>
<style>
body{{font:14px/1.45 system-ui,sans-serif;margin:24px auto;max-width:1060px;color:#1a1a1a;padding:0 16px}}
h1{{font-size:22px;margin:0 0 4px}} h2{{font-size:17px;margin:32px 0 8px;border-bottom:1px solid #ddd;padding-bottom:4px}}
h3{{margin:0 0 4px;font-size:13px;color:#666}} .sub{{color:#555;margin:0 0 16px}}
.pair{{border:1px solid #ddd;border-radius:6px;padding:12px;margin:14px 0}}
.ab{{display:grid;grid-template-columns:1fr 1fr;gap:14px}}
.imgs{{display:flex;gap:6px;align-items:flex-start}} .imgs img{{border:1px solid #ccc;width:76%;height:auto}} .imgs img.mob{{width:21%}}
.meta{{font-size:12px;color:#444;margin-top:4px}} .verdict{{margin-top:10px;font-size:13px}}
.ok{{color:#0a7a2f;margin-right:10px}} .bad{{color:#b3261e;margin-right:10px}} .tie{{color:#777;margin-right:10px}}
.grid{{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}} .rk{{display:flex;gap:8px}} .n{{font-weight:600;width:28px}}
</style>
<h1>Screenshot slop model on the frozen held-out set</h1>
<p class="sub">10 held-out Design Arena sites the model never trained on. Scores are from the probe trained on all other votes; higher = sloppier.
Percentiles compare each site with {len(ref)} current and pre-2022 YC sites. Each card shows the first desktop screen and the first mobile screen.
<br><b>Agreement with human votes on held-out pairs: {acc}.</b> Ties are shown but not scored. The score gap is how far apart the two sites are on the model's scale; gaps under 0.05 are close calls.</p>
<h2>Held-out sites ranked by model (sloppiest first)</h2><div class="grid">{grid}</div>
<h2>Every voted held-out pair ({len(pv)} pairs)</h2>{"".join(rows)}
"""
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(page)
    print(f"wrote {out} ({out.stat().st_size / 1e6:.1f} MB); held-out acc {acc}")


if __name__ == "__main__":
    main()
