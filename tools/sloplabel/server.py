"""SlopLabel: serve mirrored Design Arena sites with an annotation overlay and store labels in SQLite.

The active site is chosen by the `slop_site` cookie and served at `/`, so absolute asset paths and
client-side routers work unchanged. Tool UI and API live under `/__slop/`.
"""

import asyncio
import csv
import io
import json
import mimetypes
import os
import re
import secrets
import sqlite3
import time
from playwright.async_api import TimeoutError as PlaywrightTimeoutError
from contextlib import asynccontextmanager
from functools import lru_cache
from pathlib import Path
from urllib.parse import quote, urlparse

import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse, RedirectResponse, Response

ROOT = Path(__file__).parent
MIRROR = Path(os.environ.get("SLOP_MIRROR", Path.home() / "sites/mirror"))
MANIFEST = Path(os.environ.get("SLOP_MANIFEST", Path.home() / "slopbench/manifest.json"))
THUMBS = Path(os.environ.get("SLOP_THUMBS", Path.home() / "shots"))
DATA = Path(os.environ.get("SLOP_DATA", ROOT / "data"))
DB_PATH = DATA / "sloplabel.db"
SHOTS = DATA / "shots"
PORT = int(os.environ.get("SLOP_PORT", "8700"))
NO_STORE = {"Cache-Control": "no-store"}

SCHEMA = """
CREATE TABLE IF NOT EXISTS sites (
  site_id TEXT PRIMARY KEY, host TEXT, url TEXT, title TEXT, model TEXT, tournament TEXT,
  generation TEXT, placement TEXT, prompt TEXT,
  done INTEGER DEFAULT 0, overall_verdict TEXT, overall_score INTEGER, overall_comment TEXT, updated_at REAL
);
CREATE TABLE IF NOT EXISTS labels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id TEXT NOT NULL REFERENCES sites(site_id),
  annotator TEXT, verdict TEXT NOT NULL, tags TEXT, comment TEXT,
  page_path TEXT, viewport_w INTEGER, viewport_h INTEGER, scroll_y REAL,
  loc TEXT, loc_index INTEGER, component TEXT, component_chain TEXT,
  selector TEXT, selector_confidence TEXT, tag TEXT, text TEXT, rect TEXT, styles TEXT, html TEXT,
  shot_path TEXT, ctx_path TEXT, shot_status TEXT, created_at REAL, updated_at REAL
);
CREATE INDEX IF NOT EXISTS labels_site ON labels(site_id);
"""

LABEL_FIELDS = [
    "annotator", "verdict", "tags", "comment", "page_path", "viewport_w", "viewport_h",
    "scroll_y", "loc", "loc_index", "component", "component_chain", "selector", "selector_confidence",
    "tag", "text", "rect", "styles", "html",
]
JSON_FIELDS = {"tags", "component_chain", "rect", "styles"}
EDITABLE = {"comment", "annotator"}
VERDICTS = {"slop"}


def script_json(obj) -> str:
    """json.dumps safe to embed inside an inline <script>: no '<' can close the tag."""
    return json.dumps(obj).replace("<", "\\u003c")


def db() -> sqlite3.Connection:
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA journal_mode=WAL")
    return con


def row_to_label(r: sqlite3.Row) -> dict:
    d = dict(r)
    for k in ("severity", "verdict", "tags"):
        d.pop(k, None)
    for k in JSON_FIELDS - {"tags"}:
        d[k] = json.loads(d[k]) if d.get(k) else ([] if k == "component_chain" else {})
    d["shot_url"] = f"/__slop/api/labels/{d['id']}/shot.png" if d.get("shot_path") else None
    d["ctx_url"] = f"/__slop/api/labels/{d['id']}/ctx.png" if d.get("ctx_path") else None
    return d


def seed_sites() -> None:
    items = json.loads(MANIFEST.read_text())
    with db() as con:
        for x in items:
            host = urlparse(x["previewUrl"]).netloc
            title = re.sub(r"-[a-z0-9]{4}$", "", host.split(".")[0]).replace("-", " ").title()
            con.execute(
                """INSERT INTO sites(site_id, host, url, title, model, tournament, generation, placement, prompt)
                   VALUES(?,?,?,?,?,?,?,?,?)
                   ON CONFLICT(site_id) DO UPDATE SET host=excluded.host, url=excluded.url, title=excluded.title,
                   model=excluded.model, tournament=excluded.tournament, generation=excluded.generation,
                   placement=excluded.placement, prompt=excluded.prompt""",
                (x["site_id"], host, x["previewUrl"], title, x["model"], x["tournament"], x["generation"],
                 str(x["placement"]), x["prompt"]),
            )


def get_site(site_id: str) -> dict:
    with db() as con:
        r = con.execute("SELECT * FROM sites WHERE site_id=?", (site_id,)).fetchone()
    if not r:
        raise HTTPException(404, f"unknown site {site_id}")
    return dict(r)


def thumb_for(site: dict) -> Path | None:
    p = THUMBS / f"{site['tournament'][:8]}_p{site['placement']}_{site['model']}_fold.png"
    return p if p.exists() else None


# ---------------------------------------------------------------- element screenshots (server-side)

class Shooter:
    """Re-renders the site headlessly at the label's viewport and screenshots the labeled element."""

    def __init__(self):
        self.pw = None
        self.browser = None
        self.sem = asyncio.Semaphore(2)

    async def start(self):
        from playwright.async_api import async_playwright

        self.pw = await async_playwright().start()
        self.browser = await self.pw.chromium.launch(args=["--no-sandbox"])

    async def stop(self):
        if self.browser:
            await self.browser.close()
        if self.pw:
            await self.pw.stop()

    async def capture(self, label_id: int):
        with db() as con:
            r = con.execute("SELECT * FROM labels WHERE id=?", (label_id,)).fetchone()
        if not r:
            return
        if not self.browser:
            with db() as con:
                con.execute("UPDATE labels SET shot_status='failed: no browser' WHERE id=?", (label_id,))
            return
        lab = row_to_label(r)
        async with self.sem:
            status, shot, ctx_shot = "failed", None, None
            vw, vh = int(lab.get("viewport_w") or 1440), int(lab.get("viewport_h") or 900)
            ctx = await self.browser.new_context(
                viewport={"width": vw, "height": vh}, device_scale_factor=1,
                extra_http_headers={"X-Slop-Capture": "1"},
            )
            try:
                await ctx.add_cookies([{"name": "slop_site", "value": lab["site_id"], "url": f"http://127.0.0.1:{PORT}"}])
                page = await ctx.new_page()
                await page.goto(f"http://127.0.0.1:{PORT}{lab.get('page_path') or '/'}", wait_until="load", timeout=45000)
                await page.wait_for_timeout(1500)
                await page.evaluate(
                    """async () => { const h = document.documentElement.scrollHeight;
                       for (let y = 0; y < h; y += innerHeight * 0.7) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); }
                       scrollTo(0, 0); }"""
                )
                found = await page.evaluate(
                    """([loc, idx, sel, sy]) => {
                      let el = null;
                      if (loc) { const all = document.querySelectorAll(`[data-source-loc="${CSS.escape(loc)}"]`); el = all[idx] || (all.length === 1 ? all[0] : null); }
                      if (!el && sel) { try { el = document.querySelector(sel); } catch (_) {} }
                      if (!el) { scrollTo(0, sy || 0); return false; }
                      el.setAttribute('data-slop-capture', '1');
                      el.scrollIntoView({ block: 'center' });
                      return true;
                    }""",
                    [lab.get("loc"), lab.get("loc_index") or 0, lab.get("selector"), lab.get("scroll_y") or 0],
                )
                await page.wait_for_timeout(900)
                SHOTS.mkdir(parents=True, exist_ok=True)
                tok = secrets.token_hex(4)
                shot = SHOTS / f"{label_id}.{tok}.tmp.png"
                ctx_shot = SHOTS / f"{label_id}.{tok}_ctx.tmp.png"
                if found:
                    el = page.locator("[data-slop-capture='1']").first
                    box = await el.bounding_box()
                    if box and box["width"] > 0 and box["height"] > 0:
                        if box["height"] > 2400:
                            await page.screenshot(path=str(shot), full_page=True, clip={
                                "x": max(box["x"], 0), "y": max(box["y"] + await page.evaluate("scrollY"), 0),
                                "width": min(box["width"], vw), "height": 2400})
                        else:
                            try:
                                await el.screenshot(path=str(shot), timeout=15000, animations="disabled")
                            except PlaywrightTimeoutError:
                                # element keeps moving (scroll-driven / looping animation): clip the viewport instead
                                box = await el.bounding_box() or box
                                await page.screenshot(path=str(shot), animations="disabled", clip={
                                    "x": max(box["x"], 0), "y": max(box["y"], 0),
                                    "width": max(1, min(box["width"], vw - max(box["x"], 0))),
                                    "height": max(1, min(box["height"], vh - max(box["y"], 0)))})
                        await page.evaluate(
                            """() => { const el = document.querySelector('[data-slop-capture]'); const r = el.getBoundingClientRect();
                               const o = document.createElement('div');
                               Object.assign(o.style, {position:'fixed', left: r.left-3+'px', top: r.top-3+'px', width: r.width+6+'px',
                                 height: r.height+6+'px', border:'3px solid #ff2d55', borderRadius:'4px', zIndex: 2147483647,
                                 pointerEvents:'none', boxShadow:'0 0 0 9999px rgba(0,0,0,.25)'});
                               document.body.appendChild(o); }"""
                        )
                        await page.screenshot(path=str(ctx_shot))
                        status = "ok"
                if status != "ok":
                    rect = lab.get("rect") or {}
                    await page.screenshot(path=str(ctx_shot))
                    if rect.get("width") and rect.get("height"):
                        await page.screenshot(path=str(shot), clip={
                            "x": max(rect.get("left", 0), 0), "y": max(rect.get("top", 0), 0),
                            "width": min(rect["width"], vw), "height": min(rect["height"], vh)})
                        status = "approx"
            except Exception as e:  # noqa: BLE001
                status = f"failed: {type(e).__name__}: {str(e)[:200]}"
            finally:
                await ctx.close()
            with db() as con:
                now = con.execute("SELECT loc, loc_index, selector, page_path FROM labels WHERE id=?", (label_id,)).fetchone()
                if not now or tuple(now) != (lab.get("loc"), lab.get("loc_index"), lab.get("selector"), lab.get("page_path")):
                    # label deleted or re-targeted while we were capturing: discard this capture
                    for f in (shot, ctx_shot):
                        if f:
                            f.unlink(missing_ok=True)
                    return
                if status.startswith("failed"):
                    # keep whatever screenshots the label already has; only record the failure
                    for f in (shot, ctx_shot):
                        if f:
                            f.unlink(missing_ok=True)
                    con.execute("UPDATE labels SET shot_status=? WHERE id=?", (status, label_id))
                    return
                final_shot, final_ctx = SHOTS / f"{label_id}.png", SHOTS / f"{label_id}_ctx.png"
                for tmp, final in ((shot, final_shot), (ctx_shot, final_ctx)):
                    if tmp and tmp.exists():
                        tmp.replace(final)
                    else:
                        final.unlink(missing_ok=True)
                con.execute(
                    "UPDATE labels SET shot_path=?, ctx_path=?, shot_status=? WHERE id=?",
                    (str(final_shot) if final_shot.exists() else None,
                     str(final_ctx) if final_ctx.exists() else None, status, label_id),
                )


shooter = Shooter()
bg_tasks: set[asyncio.Task] = set()


def schedule_capture(label_id: int) -> None:
    t = asyncio.create_task(shooter.capture(label_id))
    bg_tasks.add(t)
    t.add_done_callback(bg_tasks.discard)


@asynccontextmanager
async def lifespan(_: FastAPI):
    DATA.mkdir(parents=True, exist_ok=True)
    with db() as con:
        con.executescript(SCHEMA)
    seed_sites()
    try:
        await shooter.start()
    except Exception as e:  # noqa: BLE001
        print(f"[sloplabel] element screenshots disabled: {e}")
    app.state.http = httpx.AsyncClient(timeout=30, follow_redirects=True)
    yield
    await app.state.http.aclose()
    await shooter.stop()


app = FastAPI(title="SlopLabel", lifespan=lifespan)


# ---------------------------------------------------------------- tool UI

@app.get("/__slop/")
@app.get("/__slop")
def index_page():
    return FileResponse(ROOT / "static/index.html", headers=NO_STORE)


@app.get("/__slop/labels")
def labels_page():
    return FileResponse(ROOT / "static/labels.html", headers=NO_STORE)


@app.get("/__slop/static/{name}")
def static_file(name: str):
    p = ROOT / "static" / name
    if not p.is_file():
        raise HTTPException(404)
    return FileResponse(p, headers=NO_STORE)


@app.get("/__slop/open/{site_id}")
def open_site(site_id: str, view: str = "desktop", focus: int | None = None):
    get_site(site_id)
    page_path = "/"
    if focus is not None:
        with db() as con:
            r = con.execute("SELECT page_path FROM labels WHERE id=?", (focus,)).fetchone()
        if r and r["page_path"]:
            page_path = r["page_path"]
    if view == "desktop":
        target = page_path
    else:
        target = f"/__slop/frame/{site_id}?w=390&h=844&p={quote(page_path, safe='/')}"
    resp = RedirectResponse(target, status_code=302, headers=NO_STORE)
    resp.set_cookie("slop_site", site_id, samesite="lax", path="/")
    if focus is not None:
        resp.set_cookie("slop_focus", str(focus), max_age=120, samesite="lax", path="/")
    return resp


@app.get("/__slop/frame/{site_id}")
def frame_page(site_id: str, w: int = 390, h: int = 844, p: str = "/"):
    site = get_site(site_id)
    if not p.startswith("/") or p.startswith("//"):
        p = "/"
    html = (ROOT / "static/frame.html").read_text()
    html = html.replace("__CFG__", script_json({"site_id": site_id, "title": site["title"], "model": site["model"], "w": w, "h": h, "path": p}))
    resp = HTMLResponse(html, headers=NO_STORE)
    resp.set_cookie("slop_site", site_id, samesite="lax", path="/")
    return resp


@app.get("/__slop/thumb/{site_id}.png")
def thumb(site_id: str):
    p = thumb_for(get_site(site_id))
    if not p:
        raise HTTPException(404)
    return FileResponse(p)


# ---------------------------------------------------------------- API

@app.get("/__slop/api/sites")
def list_sites():
    with db() as con:
        sites = [dict(r) for r in con.execute("SELECT * FROM sites ORDER BY site_id")]
        counts = {(r["site_id"], r["verdict"]): r["n"] for r in con.execute(
            "SELECT site_id, verdict, COUNT(*) n FROM labels GROUP BY site_id, verdict")}
    for s in sites:
        s["counts"] = {v: counts.get((s["site_id"], v), 0) for v in VERDICTS}
        s["has_thumb"] = thumb_for(s) is not None
        s["has_source_loc"] = has_source_loc(s["host"])
    return sites


@lru_cache(maxsize=None)
def has_source_loc(host: str) -> bool:
    base = MIRROR / host
    hits = 0
    for f in [*base.glob("assets/*.js"), base / "index.html"]:
        if f.is_file():
            hits += f.read_text(errors="ignore").count("data-source-loc")
    return hits > 20


@app.get("/__slop/api/sites/{site_id}")
def site_detail(site_id: str):
    return get_site(site_id)


@app.patch("/__slop/api/sites/{site_id}")
async def update_site(site_id: str, request: Request):
    get_site(site_id)
    body = await request.json()
    allowed = {k: body[k] for k in ("done", "overall_score", "overall_comment") if k in body}
    if allowed:
        sets = ", ".join(f"{k}=?" for k in allowed)
        with db() as con:
            con.execute(f"UPDATE sites SET {sets}, updated_at=? WHERE site_id=?", (*allowed.values(), time.time(), site_id))
    return get_site(site_id)


@app.get("/__slop/api/labels")
def list_labels(site: str | None = None):
    q, args = "SELECT * FROM labels WHERE 1=1", []
    if site:
        q += " AND site_id=?"; args.append(site)
    q += " ORDER BY site_id, id"
    with db() as con:
        return [row_to_label(r) for r in con.execute(q, args)]


def _norm(body: dict) -> dict:
    out = {}
    for k in LABEL_FIELDS:
        if k in body:
            v = body[k]
            out[k] = json.dumps(v) if k in JSON_FIELDS else v
    out.pop("verdict", None)
    out.pop("tags", None)
    return out


def _has_comment(vals: dict) -> bool:
    return bool((vals.get("comment") or "").strip())


@app.post("/__slop/api/labels")
async def create_label(request: Request):
    body = await request.json()
    site_id = body.get("site_id") or request.cookies.get("slop_site")
    get_site(site_id)
    vals = _norm(body)
    vals["verdict"] = "slop"
    now = time.time()
    cols = ["site_id", *vals.keys(), "shot_status", "created_at", "updated_at"]
    with db() as con:
        cur = con.execute(
            f"INSERT INTO labels({', '.join(cols)}) VALUES({', '.join('?' * len(cols))})",
            (site_id, *vals.values(), "pending", now, now),
        )
        label_id = cur.lastrowid
        r = con.execute("SELECT * FROM labels WHERE id=?", (label_id,)).fetchone()
    schedule_capture(label_id)
    return row_to_label(r)


@app.put("/__slop/api/labels/{label_id}")
async def update_label(label_id: int, request: Request):
    """Autosave target. `retarget: true` also moves the label to a new element (fields from describe())."""
    body = await request.json()
    norm = _norm(body)
    retarget = bool(body.get("retarget"))
    vals = norm if retarget else {k: v for k, v in norm.items() if k in EDITABLE}
    with db() as con:
        old = con.execute("SELECT * FROM labels WHERE id=?", (label_id,)).fetchone()
        if not old:
            raise HTTPException(404)
        if vals:
            sets = ", ".join(f"{k}=?" for k in vals)
            con.execute(f"UPDATE labels SET {sets}, updated_at=? WHERE id=?", (*vals.values(), time.time(), label_id))
        r = con.execute("SELECT * FROM labels WHERE id=?", (label_id,)).fetchone()
        need_shot = retarget or r["shot_status"] == "waiting"
        if retarget and not need_shot:
            con.execute("UPDATE labels SET shot_status='waiting', shot_path=NULL, ctx_path=NULL WHERE id=?", (label_id,))
        if need_shot:
            con.execute("UPDATE labels SET shot_status='pending' WHERE id=?", (label_id,))
        r = con.execute("SELECT * FROM labels WHERE id=?", (label_id,)).fetchone()
    if retarget:
        for f in (old["shot_path"], old["ctx_path"]):
            if f:
                Path(f).unlink(missing_ok=True)
    if need_shot:
        schedule_capture(label_id)
    return row_to_label(r)


@app.delete("/__slop/api/labels/{label_id}")
def delete_label(label_id: int):
    with db() as con:
        r = con.execute("SELECT shot_path, ctx_path FROM labels WHERE id=?", (label_id,)).fetchone()
        con.execute("DELETE FROM labels WHERE id=?", (label_id,))
    if r:
        for p in (r["shot_path"], r["ctx_path"]):
            if p:
                Path(p).unlink(missing_ok=True)
    return {"ok": True}


@app.post("/__slop/api/labels/{label_id}/recapture")
async def recapture(label_id: int):
    with db() as con:
        con.execute("UPDATE labels SET shot_status='pending' WHERE id=?", (label_id,))
    schedule_capture(label_id)
    return {"ok": True}


@app.get("/__slop/api/labels/{label_id}/{kind}.png")
def label_shot(label_id: int, kind: str):
    with db() as con:
        r = con.execute("SELECT shot_path, ctx_path FROM labels WHERE id=?", (label_id,)).fetchone()
    p = r and (r["shot_path"] if kind == "shot" else r["ctx_path"])
    if not p or not Path(p).exists():
        raise HTTPException(404)
    return FileResponse(p, headers=NO_STORE)


@app.get("/__slop/api/export.json")
def export_json():
    with db() as con:
        sites = [dict(r) for r in con.execute("SELECT * FROM sites ORDER BY site_id")]
    labels = list_labels()
    return JSONResponse({"exported_at": time.time(), "sites": sites, "labels": labels},
                        headers={"Content-Disposition": "attachment; filename=sloplabel-export.json"})


@app.get("/__slop/api/export.csv")
def export_csv():
    labels = list_labels()
    sites = {s["site_id"]: s for s in list_sites()}
    cols = ["id", "site_id", "title", "model", "tournament", "placement", "annotator",
            "comment", "component", "loc", "loc_index", "selector", "tag", "text", "page_path", "viewport_w",
            "shot_url", "created_at"]
    buf = io.StringIO()
    w = csv.DictWriter(buf, fieldnames=cols, extrasaction="ignore")
    w.writeheader()
    for l in labels:
        s = sites.get(l["site_id"], {})
        w.writerow({**l, "title": s.get("title"), "model": s.get("model"), "tournament": s.get("tournament"),
                    "placement": s.get("placement")})
    return Response(buf.getvalue(), media_type="text/csv",
                    headers={"Content-Disposition": "attachment; filename=sloplabel-labels.csv"})


# ---------------------------------------------------------------- site proxy (catch-all, must be last)

HEAD_GUARD = """<script>(function(){window.__SLOP=__CFG__;try{var k='__slop_site',a=localStorage.getItem('__slop_annotator');
if(localStorage.getItem(k)!==__SLOP.site_id){localStorage.clear();sessionStorage.clear();localStorage.setItem(k,__SLOP.site_id);if(a)localStorage.setItem('__slop_annotator',a);}}catch(e){}
if(navigator.serviceWorker){navigator.serviceWorker.getRegistrations().then(function(r){r.forEach(function(x){x.unregister()})}).catch(function(){});
try{navigator.serviceWorker.register=function(){return Promise.reject(new Error('disabled by sloplabel'))};}catch(e){}}})();</script>"""


def inject(html: str, site: dict, capture: bool) -> str:
    cfg = script_json({"site_id": site["site_id"], "title": site["title"], "model": site["model"],
                      "placement": site["placement"], "tournament": site["tournament"], "url": site["url"]})
    guard = HEAD_GUARD.replace("__CFG__", cfg)
    m = re.search(r"<head[^>]*>", html, re.I)
    html = html[: m.end()] + guard + html[m.end():] if m else guard + html
    if not capture:
        tag = '<script src="/__slop/static/overlay.js" defer></script>'
        html = re.sub(r"</body>", tag + "</body>", html, count=1, flags=re.I) if re.search(r"</body>", html, re.I) else html + tag
    return html


@app.api_route("/{path:path}", methods=["GET", "HEAD"])
async def site_proxy(path: str, request: Request):
    site_id = request.cookies.get("slop_site")
    if not site_id:
        return RedirectResponse("/__slop/", status_code=302)
    site = get_site(site_id)
    base = (MIRROR / site["host"]).resolve()
    rel = path.split("?")[0].lstrip("/")
    f = (base / rel).resolve()
    if not str(f).startswith(str(base)):
        raise HTTPException(403)
    capture = request.headers.get("x-slop-capture") == "1"
    looks_like_file = bool(Path(rel).suffix)

    if f.is_dir():
        f = f / "index.html"
    if not f.exists() and looks_like_file:
        r = await app.state.http.get(f"{site['url'].rstrip('/')}/{rel}")
        if r.status_code == 200 and "text/html" not in r.headers.get("content-type", ""):
            f.parent.mkdir(parents=True, exist_ok=True)
            f.write_bytes(r.content)
        else:
            return Response(status_code=404, headers=NO_STORE)
    if not f.exists():
        f = base / "index.html"  # SPA fallback for client-side routes

    if f.suffix == ".html":
        return HTMLResponse(inject(f.read_text(errors="replace"), site, capture), headers=NO_STORE)
    mt = mimetypes.guess_type(str(f))[0] or "application/octet-stream"
    return FileResponse(f, media_type=mt, headers=NO_STORE)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=PORT)
