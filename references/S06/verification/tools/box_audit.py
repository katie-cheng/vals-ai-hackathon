"""Box consistency audit (from references/S13): sibling boxes that differ in width, row height or padding, and every small square box by size and radius.

usage: python box_audit.py URL [WIDTH] > report.jsonl
"""
import sys, json
from playwright.sync_api import sync_playwright
JS = r"""
() => {
  const out = [];
  const boxes = [...document.querySelectorAll('body *')].filter(e => {
    const cs = getComputedStyle(e); const r = e.getBoundingClientRect();
    if (r.width < 16 || r.height < 16 || cs.visibility === 'hidden' || cs.display === 'none') return false;
    const bw = parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== 'none' && parseFloat(cs.borderLeftWidth) > 0;
    const bg = cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && parseFloat(cs.borderTopLeftRadius) > 0;
    return bw || bg;
  });
  const boxesSet = new Set(boxes);
  const groups = new Map();
  const isNested = e => { let a = e.parentElement; while (a) { if (boxesSet.has(a)) return true; a = a.parentElement; } return false; };
  const set = boxesSet;
  for (const e of boxes) { let p = e.parentElement; for (let d = 0; d < 3 && p && p.parentElement; d++) { const sibs = [...p.children].filter(c => set.has(c) || [...c.querySelectorAll('*')].some(x => set.has(x))); if (sibs.length > 1) break; p = p.parentElement; } if (isNested(e)) continue; const key = p; const k2 = e.className.toString(); if (!groups.has(key)) groups.set(key, new Map()); const m = groups.get(key); if (!m.has(k2)) m.set(k2, []); m.get(k2).push(e); }
  const sq = {}; boxes.forEach(e => { const r = e.getBoundingClientRect(); if (r.width < 80 && Math.abs(r.width - r.height) < 3) { const k = Math.round(r.width) + 'px r' + getComputedStyle(e).borderTopLeftRadius; (sq[k] ||= []).push((e.getAttribute('aria-label') || e.className.toString()).slice(0, 30)); } });
  out.push({ squares: Object.fromEntries(Object.entries(sq).map(([k, v]) => [k, v.length + ': ' + [...new Set(v)].slice(0, 4).join(' | ')])) });
  for (const [p, m] of groups) for (const kids0 of m.values()) { const kids = kids0;
    if (kids.length < 2) continue;
    const rs = kids.map(k => { const b = k.getBoundingClientRect(); return { top: b.top, left: b.left, width: k.offsetWidth || b.width, height: k.offsetHeight || b.height }; });
    const rows = {};
    rs.forEach((r, i) => { const key = Math.round(r.top); (rows[key] ||= []).push(i); });
    const ws = rs.map(r => Math.round(r.width)), hs = rs.map(r => Math.round(r.height));
    const rowHVar = Object.values(rows).some(ix => { const h = ix.map(i => hs[i]); return Math.max(...h) - Math.min(...h) > 2; });
    const wVar = Math.max(...ws) - Math.min(...ws);
    const pads = kids.map(k => { const c = getComputedStyle(k); return c.paddingTop + '/' + c.paddingLeft; });
    const padVar = new Set(pads).size > 1;
    const lefts = {}; rs.forEach(r => lefts[Math.round(r.left)] = 1);
    if (wVar > 2 || rowHVar || padVar)
      out.push({ parent: (p.closest('section,header,footer')||{}).id || p.closest('section,header,footer')?.tagName, cls: p.className.toString().slice(0, 80), n: kids.length, ws: [...new Set(ws)].slice(0, 8), hs: [...new Set(hs)].slice(0, 8), pads: [...new Set(pads)], text: kids.map(k => k.innerText.trim().split('\n')[0].slice(0, 18)).slice(0, 4) });
  }
  return out;
}
"""
URL = sys.argv[1].rstrip('/')
w = int(sys.argv[2]) if len(sys.argv) > 2 else 1440
ROUTES = ["/", "/menu", "/about", "/gallery", "/reviews", "/contact", "/order", "/login"]
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': w, 'height': 900})
    for route in ROUTES:
        pg.goto(URL + route); pg.wait_for_timeout(1200)
        for y in range(0, 12000, 600): pg.evaluate(f"scrollTo(0,{y})"); pg.wait_for_timeout(80)
        pg.wait_for_timeout(600)
        for g in pg.evaluate(JS): print(json.dumps({'route': route, **g}))
    b.close()
