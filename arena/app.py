"""Slop Arena: blind pairwise "which site is sloppier?" votes."""
import functools, hashlib, io, json, math, os, pathlib, random, sqlite3, threading, time
from collections import defaultdict
from flask import Flask, abort, g, jsonify, request, send_file, send_from_directory

ROOT = pathlib.Path(__file__).resolve().parent.parent
SNAP = ROOT / "data/snapshots"
DB = pathlib.Path(os.environ.get("ARENA_DB", pathlib.Path.home() / "slopbench-arena-data/arena.db"))
CATEGORY_WEIGHTS = {"same_prompt": 0.3, "arena_cross": 0.25, "arena_vs_web": 0.3, "web_web": 0.15}

app = Flask(__name__, static_folder="static")

SCHEMA = """
CREATE TABLE IF NOT EXISTS votes (
  id INTEGER PRIMARY KEY, voter TEXT NOT NULL, left_id TEXT NOT NULL, right_id TEXT NOT NULL,
  category TEXT, view TEXT, choice TEXT NOT NULL CHECK (choice IN ('left','right','same','both','neither','skip')),
  reason TEXT, broken_left INTEGER DEFAULT 0, broken_right INTEGER DEFAULT 0,
  ship_left TEXT, ship_right TEXT, ms INTEGER, created_at REAL NOT NULL);
CREATE TABLE IF NOT EXISTS removed (site_id TEXT PRIMARY KEY, voter TEXT, created_at REAL NOT NULL);
"""


def db():
    if "db" not in g:
        DB.parent.mkdir(parents=True, exist_ok=True)
        g.db = sqlite3.connect(DB)
        g.db.row_factory = sqlite3.Row
        old = g.db.execute("SELECT sql FROM sqlite_master WHERE name='votes'").fetchone()
        if old and "'both'" not in old[0]:
            g.db.executescript("ALTER TABLE votes RENAME TO votes_old;" + SCHEMA +
                               "INSERT INTO votes SELECT * FROM votes_old; DROP TABLE votes_old;")
        g.db.executescript(SCHEMA)
    return g.db


@app.teardown_appcontext
def close_db(_):
    if "db" in g:
        g.pop("db").close()


_sites, _sites_at, _lock = {}, 0.0, threading.Lock()


def usable_capture(meta):
    st = (meta.get("stats") or {}).get("desktop") or {}
    return (meta.get("views", {}).get("desktop") == "ok" and st.get("text_len", 0) >= 200
            and st.get("height", 0) >= 600 and st.get("stylesheets", 0) > 0 and not st.get("blank"))


def sites():
    """Site registry, rebuilt from disk at most once a minute so new snapshots show up without a redeploy."""
    global _sites, _sites_at
    with _lock:
        if time.time() - _sites_at < 60 and _sites:
            return _sites
        out = {}
        splits = json.load(open(ROOT / "data/splits.json"))
        export = sorted((ROOT / "data/sloplabel").glob("export-*.json"))
        prompts = {s["site_id"]: s.get("prompt") for s in json.load(open(export[-1]))["sites"]} if export else {}
        for split in ("dev", "heldout"):
            for s in splits[split]:
                d = SNAP / split / s["site_id"]
                if (d / "desktop.png").exists():
                    out[s["site_id"]] = dict(id=s["site_id"], kind="arena", split=split, group=s["tournament"],
                                             model=s["model"], placement=s["placement"], url=s["url"],
                                             prompt=prompts.get(s["site_id"]), dir=str(d))
        for yset in ("pre2022", "current"):
            for m in (SNAP / "yc" / yset).glob("*/meta.json"):
                meta = json.load(open(m))
                if not usable_capture(meta):
                    continue
                sid = ("ycp-" if yset == "pre2022" else "ycc-") + meta["slug"]
                out[sid] = dict(id=sid, kind="web", split=f"yc-{yset}", group=sid,
                                model="human:yc-pre2022" if yset == "pre2022" else "yc-current",
                                url=meta["render_url"], name=meta["name"], batch=meta["batch"],
                                industry=meta.get("industry"), dir=str(m.parent))
        for m in (SNAP / "ai").glob("*/*/meta.json"):
            meta = json.load(open(m))
            if not usable_capture(meta):
                continue
            sid = f"ai-{meta['source']}-{meta['slug']}"
            out[sid] = dict(id=sid, kind="web", split=meta["source"], group=sid, model=f"ai:{meta['source']}",
                            url=meta["render_url"], dir=str(m.parent))
        _sites, _sites_at = out, time.time()
        return out


def removed():
    return {r["site_id"]: dict(r) for r in db().execute("SELECT * FROM removed")}


def live_sites():
    """Sites minus those someone marked "stop showing"; removed sites are excluded from pairs, results and export."""
    gone = removed()
    return {k: v for k, v in sites().items() if k not in gone}


def candidate_pairs(S):
    arena = [s for s in S.values() if s["kind"] == "arena"]
    web = [s for s in S.values() if s["kind"] == "web"]
    cats = defaultdict(list)
    for i, a in enumerate(arena):
        for b in arena[i + 1:]:
            cats["same_prompt" if a["group"] == b["group"] else "arena_cross"].append((a["id"], b["id"]))
        for b in web:
            cats["arena_vs_web"].append((a["id"], b["id"]))
    for i, a in enumerate(web):
        for b in web[i + 1:]:
            cats["web_web"].append((a["id"], b["id"]))
    return cats


def pair_key(a, b):
    return tuple(sorted((a, b)))


@functools.lru_cache(maxsize=1)
def salt():
    salt_file = DB.parent / "salt"
    if not salt_file.exists():
        salt_file.parent.mkdir(parents=True, exist_ok=True)
        salt_file.write_text(os.urandom(16).hex())
    return salt_file.read_text()


@functools.lru_cache(maxsize=None)
def token(sid):
    """Opaque per-site id so voters can't tell arena sites, YC sites or models apart from the id."""
    return hashlib.sha256((salt() + sid).encode()).hexdigest()[:12]


def resolve(tok):
    for sid in sites():
        if token(sid) == tok:
            return sid
    return None


def public_site(s):
    t = token(s["id"])
    return {"id": t, "desktop": f"/shots/{t}/desktop.webp", "mobile": f"/shots/{t}/mobile.webp", "live": s["url"]}


@app.get("/")
def index():
    return send_from_directory(app.static_folder, "index.html")


@app.get("/results")
def results_page():
    return send_from_directory(app.static_folder, "results.html")


CACHE = DB.parent / "shots"
SHOT_WIDTH = {"desktop": 1000, "mobile": 390}
MAX_SHOT_HEIGHT = 9000


def compressed_shot(s, view):
    """Full-page PNGs are multi-MB; serve a resized, height-capped WebP, cached on disk."""
    src = pathlib.Path(s["dir"]) / f"{view}.png"
    if not src.exists():
        return None
    out = CACHE / f"{token(s['id'])}-{view}.webp"
    if not out.exists() or out.stat().st_mtime < src.stat().st_mtime:
        from PIL import Image
        im = Image.open(src).convert("RGB")
        w = SHOT_WIDTH[view]
        h = min(round(im.height * w / im.width), MAX_SHOT_HEIGHT)
        im = im.crop((0, 0, im.width, round(h * im.width / w))).resize((w, h), Image.LANCZOS)
        CACHE.mkdir(parents=True, exist_ok=True)
        tmp = out.with_suffix(f".{os.getpid()}.tmp")
        im.save(tmp, "WEBP", quality=72, method=4)
        tmp.replace(out)
    return out


@app.get("/shots/<sid>/<view>.<ext>")
def shot(sid, view, ext):
    s = sites().get(resolve(sid) or "")
    if not s or view not in ("desktop", "mobile"):
        abort(404)
    p = compressed_shot(s, view) if ext == "webp" else pathlib.Path(s["dir"]) / f"{view}.png"
    if not p or not p.exists():
        abort(404)
    return send_file(p, max_age=86400)


def warm_cache():
    import fcntl
    CACHE.mkdir(parents=True, exist_ok=True)
    lock = open(CACHE / ".warm.lock", "w")
    try:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except OSError:
        return
    while True:
        for s in list(sites().values()):
            for view in SHOT_WIDTH:
                try:
                    compressed_shot(s, view)
                except Exception:
                    pass
        time.sleep(60)


@app.get("/api/next")
def next_pair():
    voter = (request.args.get("voter") or "").strip()
    S = live_sites()
    cats = candidate_pairs(S)
    rows = db().execute("SELECT voter, left_id, right_id FROM votes WHERE choice != 'skip' OR voter = ?", (voter,)).fetchall()
    counts, mine = defaultdict(int), set()
    for r in rows:
        k = pair_key(r["left_id"], r["right_id"])
        counts[k] += 1
        if r["voter"] == voter:
            mine.add(k)
    ex = [resolve(t) for t in (request.args.get("exclude") or "").split(",") if t]
    if len(ex) == 2 and all(ex):
        mine.add(pair_key(*ex))
    avail = {c: [p for p in ps if pair_key(*p) not in mine] for c, ps in cats.items()}
    avail = {c: ps for c, ps in avail.items() if ps}
    if not avail:
        return jsonify({"done": True})
    names = list(avail)
    cat = random.choices(names, weights=[CATEGORY_WEIGHTS.get(c, 0.1) for c in names])[0]
    ps = avail[cat]
    low = min(counts[pair_key(*p)] for p in ps)
    a, b = random.choice([p for p in ps if counts[pair_key(*p)] == low])
    if random.random() < 0.5:
        a, b = b, a
    prompt = S[a]["prompt"] if cat == "same_prompt" else None
    return jsonify({"category": cat, "left": public_site(S[a]), "right": public_site(S[b]), "prompt": prompt})


@app.post("/api/vote")
def vote():
    v = request.get_json(force=True)
    voter = (v.get("voter") or "").strip()
    S = sites()
    v["left"], v["right"] = resolve(v.get("left") or ""), resolve(v.get("right") or "")
    if not voter or v.get("left") not in S or v.get("right") not in S or v.get("choice") not in ("left", "right", "both", "neither", "skip"):
        abort(400)
    db().execute(
        "INSERT INTO votes (voter,left_id,right_id,category,view,choice,reason,broken_left,broken_right,ship_left,ship_right,ms,created_at)"
        " VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
        (voter, v["left"], v["right"], v.get("category"), v.get("view"), v["choice"], (v.get("reason") or "").strip() or None,
         int(bool(v.get("broken_left"))), int(bool(v.get("broken_right"))), v.get("ship_left"), v.get("ship_right"),
         v.get("ms"), time.time()))
    db().commit()
    return jsonify({"ok": True})


def bradley_terry(comparisons, ids, iters=200, prior=1.0):
    """MM fit of P(i sloppier than j) = p_i/(p_i+p_j); ties count half each way. Returns log-strength (higher = sloppier)."""
    wins = defaultdict(float)
    n = defaultdict(float)
    for a, b, wa in comparisons:
        wins[a] += wa
        wins[b] += 1 - wa
        n[pair_key(a, b)] += 1
    p = {i: 1.0 for i in ids}
    for _ in range(iters):
        new = {}
        for i in ids:
            denom = prior * 2 / (p[i] + 1.0)  # weak prior: one tie against a virtual average site
            for (x, y), c in n.items():
                if i in (x, y):
                    j = y if i == x else x
                    denom += c / (p[i] + p[j])
            new[i] = (wins[i] + prior) / denom if denom else p[i]
        mean = math.exp(sum(math.log(x) for x in new.values()) / len(new))
        p = {i: x / mean for i, x in new.items()}
    return {i: math.log(x) for i, x in p.items()}


@app.post("/api/remove")
def remove_site():
    v = request.get_json(force=True)
    sid, voter = resolve(v.get("site") or ""), (v.get("voter") or "").strip()
    if not sid or not voter:
        abort(400)
    db().execute("INSERT OR REPLACE INTO removed (site_id, voter, created_at) VALUES (?,?,?)", (sid, voter, time.time()))
    db().commit()
    return jsonify({"ok": True})


@app.post("/api/restore")
def restore_site():
    db().execute("DELETE FROM removed WHERE site_id = ?", ((request.get_json(force=True).get("site") or ""),))
    db().commit()
    return jsonify({"ok": True})


@app.get("/api/results")
def results():
    S = live_sites()
    rows = [dict(r) for r in db().execute("SELECT * FROM votes ORDER BY id").fetchall()]
    real = [r for r in rows if r["choice"] != "skip" and r["left_id"] in S and r["right_id"] in S]
    comps = [(r["left_id"], r["right_id"], {"left": 1.0, "right": 0.0}.get(r["choice"], 0.5)) for r in real]
    ids = sorted({x for c in comps for x in c[:2]})
    scores = bradley_terry(comps, ids) if ids else {}
    nvotes = defaultdict(int)
    broken, ship = defaultdict(int), defaultdict(lambda: [0, 0])
    both, neither = defaultdict(int), defaultdict(int)
    for r in real:
        for side in ("left", "right"):
            sid = r[f"{side}_id"]
            nvotes[sid] += 1
            both[sid] += r["choice"] == "both"
            neither[sid] += r["choice"] == "neither"
            broken[sid] += r[f"broken_{side}"]
            if r[f"ship_{side}"] in ("yes", "no"):
                ship[sid][0 if r[f"ship_{side}"] == "yes" else 1] += 1
    site_rows = sorted(({"id": i, "split": S[i]["split"], "model": S[i]["model"], "score": round(scores[i], 3),
                         "votes": nvotes[i], "broken": broken[i], "both_slop": both[i], "neither_slop": neither[i], "ship_yes": ship[i][0], "ship_no": ship[i][1],
                         "url": S[i]["url"]} for i in ids), key=lambda r: -r["score"])
    by_model = defaultdict(list)
    for r in site_rows:
        by_model[r["model"]].append(r["score"])
    model_rows = sorted(({"model": m, "sites": len(v), "mean_score": round(sum(v) / len(v), 3)} for m, v in by_model.items()),
                        key=lambda r: -r["mean_score"])
    pv = defaultdict(list)
    for r in real:
        k = pair_key(r["left_id"], r["right_id"])
        winner = {"left": r["left_id"], "right": r["right_id"]}.get(r["choice"], r["choice"])
        pv[k].append((r["voter"], winner))
    agree = [len({w for _, w in vs}) == 1 for vs in pv.values() if len({v for v, _ in vs}) >= 2]
    voters = defaultdict(int)
    for r in real:
        voters[r["voter"]] += 1
    cats = defaultdict(int)
    for r in real:
        cats[r["category"]] += 1
    return jsonify({"votes": len(real), "skips": len(rows) - len(real), "voters": voters, "categories": cats,
                    "pairs_multi_voter": len(agree), "pair_agreement": (sum(agree) / len(agree)) if agree else None,
                    "sites": site_rows, "models": model_rows, "sites_available": len(S),
                    "removed": [{"id": k, "voter": r["voter"], "url": sites().get(k, {}).get("url"),
                                 "model": sites().get(k, {}).get("model")} for k, r in removed().items()]})


@app.get("/api/export")
def export():
    S = live_sites()
    rows = [dict(r) for r in db().execute("SELECT * FROM votes ORDER BY id").fetchall()
            if r["left_id"] in S and r["right_id"] in S]
    meta = {k: {f: v for f, v in s.items() if f != "dir"} for k, s in S.items()}
    return jsonify({"exported_at": time.time(), "sites": meta, "votes": rows, "removed_sites": sorted(removed())})


threading.Thread(target=warm_cache, daemon=True).start()


if __name__ == "__main__":
    app.run(port=int(os.environ.get("PORT", 5055)), debug=True)
