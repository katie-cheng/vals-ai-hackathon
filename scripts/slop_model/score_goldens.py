"""Score DEB golden reference sites against their original Design Arena builds with the screenshot slop probe.

Screenshots each built golden (tasks/<slug>/solution, built into <dist-root>/<slug>/dist) the way snapshot_sites.py
captures arena sites, crops it the way prep_crops.py does, embeds the crops with SigLIP on the local CPU and scores
them with data/models/probe_w.npy. Higher score = predicted sloppier.
Usage: python3 scripts/slop_model/score_goldens.py <dist-root> [out.json]
"""
import functools, http.server, io, json, pathlib, re, sys, threading

import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from train_probe import ROOT, load  # noqa: E402

REPO = ROOT.parents[1]
MODEL = "google/siglip-so400m-patch14-384"
VIEWPORTS = {"desktop": (1440, 900), "mobile": (390, 844)}
SHOT_WIDTH = {"desktop": 1000, "mobile": 390}
CROPS = [("desktop", 0, 625), ("desktop", 625, 625), ("desktop", 1250, 625), ("mobile", 0, 844)]


class SpaHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def send_head(self):
        if not (pathlib.Path(self.directory) / self.path.split("?")[0].lstrip("/")).exists():
            self.path = "/index.html"
        return super().send_head()


def screenshot(dist):
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(SpaHandler, directory=str(dist)))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    url = f"http://127.0.0.1:{srv.server_address[1]}/"
    shots = {}
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for name, (w, h) in VIEWPORTS.items():
            ctx = browser.new_context(viewport={"width": w, "height": h}, is_mobile=name == "mobile")
            page = ctx.new_page()
            page.goto(url, wait_until="load", timeout=60000)
            page.wait_for_timeout(2500)
            for y in range(0, page.evaluate("document.body.scrollHeight"), h):
                page.evaluate(f"window.scrollTo(0,{y})")
                page.wait_for_timeout(150)
            page.evaluate("window.scrollTo(0,0)")
            page.wait_for_timeout(500)
            shots[name] = Image.open(io.BytesIO(page.screenshot(full_page=True))).convert("RGB")
            ctx.close()
        browser.close()
    srv.shutdown()
    return shots


def crops(shots):
    out = []
    for view, top, h in CROPS:
        im = shots[view]
        w = SHOT_WIDTH[view]
        hh = min(round(im.height * w / im.width), 9000)
        im = im.crop((0, 0, im.width, round(hh * im.width / w))).resize((w, hh), Image.LANCZOS)
        b = io.BytesIO(); im.save(b, "WEBP", quality=72, method=4); im = Image.open(b).convert("RGB")
        if top and im.height < top + h // 2:
            continue
        out.append((view, im.crop((0, top, im.width, min(im.height, top + h)))))
    return out


def embed(images):
    import torch
    from transformers import AutoModel, AutoProcessor
    model = AutoModel.from_pretrained(MODEL).eval()
    proc = AutoProcessor.from_pretrained(MODEL)
    out = []
    for i in range(0, len(images), 8):
        ims = []
        for im in images[i:i + 8]:
            b = io.BytesIO(); im.save(b, "JPEG", quality=90); ims.append(Image.open(b).convert("RGB"))
        with torch.no_grad():
            e = model.get_image_features(pixel_values=proc(images=ims, return_tensors="pt")["pixel_values"])
        out += torch.nn.functional.normalize(e.float(), dim=-1).numpy().tolist()
    return np.array(out)


def main():
    root = pathlib.Path(sys.argv[1])
    sites, _, F = load()
    w = np.load(ROOT / "probe_w.npy")
    tasks = {}
    for toml in sorted((REPO / "tasks").glob("*/task.toml")):
        slug = toml.parent.name
        m = re.search(r'^source = "(.*)"', toml.read_text(), re.M)
        if slug == "it-beginner-platform" or not m or not (root / slug / "dist/index.html").exists():
            continue
        tasks[slug] = sorted(set(re.findall(r"\bS\d\d\b", m.group(1))))
    flat, owner = [], []
    for slug in tasks:
        for view, im in crops(screenshot(root / slug / "dist")):
            flat.append(im); owner.append((slug, view))
        print("shot", slug, flush=True)
    E = embed(flat)
    arena = {k: float(F[k] @ w) for k, s in sites.items() if k in F and s["kind"] == "arena"}
    web = sorted(float(F[k] @ w) for k, s in sites.items() if k in F and s["kind"] == "web")
    rows = []
    for slug, orig in tasks.items():
        desk = [e for e, (s, v) in zip(E, owner) if s == slug and v == "desktop"]
        mob = [e for e, (s, v) in zip(E, owner) if s == slug and v == "mobile"] or desk[:1]
        g = float(np.concatenate([desk[0], np.mean(desk, 0), mob[0]]) @ w)
        rows.append(dict(task=slug, golden=g, originals={s: arena.get(s) for s in orig},
                         golden_web_pct=float(np.mean(np.array(web) < g))))
    for r in rows:
        o = "  ".join(f"{s}={v:+.2f}" if v is not None else f"{s}=n/a" for s, v in r["originals"].items())
        print(f"{r['task']:22s} golden={r['golden']:+.2f}  {o}  web-pct={r['golden_web_pct']:.2f}")
    if len(sys.argv) > 2:
        json.dump(dict(rows=rows, arena=arena, web=web), open(sys.argv[2], "w"), indent=1)


if __name__ == "__main__":
    main()
