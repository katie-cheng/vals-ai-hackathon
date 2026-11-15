/* SlopLabel overlay: pick components on a mirrored site, label them slop / not slop, store via /__slop/api. */
(() => {
  if (window.__slopOverlay || window.__SLOP === undefined) return;
  window.__slopOverlay = true;
  const CFG = window.__SLOP;
  const SITE = CFG.site_id;
  const API = '/__slop/api';
  const IN_FRAME = window.top !== window;

  const STYLE = `
  :host{all:initial}
  *{box-sizing:border-box;font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
  [hidden]{display:none!important}
  .outline{position:fixed;pointer-events:none;border:2px solid #2563eb;background:rgba(37,99,235,.10);border-radius:2px}
  .outline.sel{border-color:#ff2d55;background:rgba(255,45,85,.08);border-style:solid}
  .outline.sel::after{content:attr(data-badge);position:absolute;left:14px;bottom:100%;background:#ff2d55;color:#fff;font:600 11px/18px system-ui;padding:0 6px;border-radius:3px 3px 0 0;white-space:nowrap}
  .mark{position:fixed;pointer-events:none;border:2px solid #e11d48;background:rgba(225,29,72,.10);border-radius:2px}
  .outline.flash{border-color:#f59e0b;background:rgba(245,158,11,.15)}
  .tip{position:fixed;pointer-events:none;background:#111;color:#f5f5f5;font:12px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;padding:6px 8px;border-radius:4px;max-width:min(560px,90vw);box-shadow:0 2px 8px rgba(0,0,0,.4)}
  .tip .crumbs{color:#9ca3af;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .tip .main{color:#7dd3fc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .tip .keys{color:#a3a3a3;font-size:11px;margin-top:2px}
  .pin{position:fixed;pointer-events:auto;min-width:20px;height:20px;padding:0 5px;border-radius:10px;font:600 11px/16px system-ui;text-align:center;color:#fff;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.5);border:2px solid #fff;transform:translate(-30%,-50%)}
  .slop{background:#e11d48}.not_slop{background:#16a34a}.unsure{background:#6b7280}
  .bar{position:fixed;left:12px;bottom:12px;pointer-events:auto;display:flex;gap:2px;align-items:center;background:#111;color:#fff;border-radius:8px;padding:4px;box-shadow:0 4px 18px rgba(0,0,0,.4);font-size:12px;max-width:calc(100vw - 24px);flex-wrap:wrap}
  .bar button{all:unset;cursor:pointer;padding:6px 9px;border-radius:5px;color:#e5e5e5;font-size:12px;white-space:nowrap}
  .bar button:hover{background:#2a2a2a}
  .bar button.on{background:#2563eb;color:#fff}
  .bar .site{padding:0 8px 0 6px;color:#a3a3a3;max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .bar .site b{color:#fff;font-weight:600}
  .card{position:fixed;top:12px;right:12px;width:370px;max-height:calc(100vh - 24px);overflow:auto;pointer-events:auto;background:#fff;color:#111;border-radius:10px;box-shadow:0 12px 40px rgba(0,0,0,.35);font-size:13px;border:1px solid #e5e5e5}
  .panel.left{right:auto;left:12px;max-height:calc(100vh - 80px)}
  .panel .hdr{cursor:move;user-select:none}
  .panel.min .sec:not(:first-child){display:none}
  .panel.min .sec .detail{display:none}
  @media (max-width:640px){.panel .hdr{cursor:default}}
  @media (max-width:640px){.card{top:auto;bottom:0;right:0;left:0;width:auto;max-height:62vh;border-radius:12px 12px 0 0}}
  .sec{padding:10px 12px;border-bottom:1px solid #f0f0f0}
  .sec:last-child{border-bottom:0}
  .h{font-weight:600;font-size:12px;color:#525252;margin:0 0 6px}
  .row{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
  .mono{font:12px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace}
  .muted{color:#737373}
  .crumb{all:unset;cursor:pointer;font:12px ui-monospace,Menlo,monospace;padding:2px 6px;border-radius:4px;background:#f5f5f5;color:#404040}
  .crumb:hover{background:#e5e5e5}.crumb.cur{background:#ffe4e9;color:#be123c}
  .sep{color:#a3a3a3;font-size:11px}
  .btn{all:unset;cursor:pointer;padding:6px 10px;border-radius:6px;border:1px solid #d4d4d4;background:#fff;color:#171717;font-size:13px;text-align:center}
  .btn:hover{background:#f5f5f5}
  .btn.sm{padding:3px 7px;font-size:12px}
  .btn.primary{background:#171717;color:#fff;border-color:#171717}
  .btn.primary:hover{background:#333}
  .btn.danger{color:#be123c;border-color:#fecdd3}
  .vbtn{flex:1}
  .vbtn.on.slop{background:#e11d48;color:#fff;border-color:#e11d48}
  .vbtn.on.not_slop{background:#16a34a;color:#fff;border-color:#16a34a}
  .vbtn.on.unsure{background:#525252;color:#fff;border-color:#525252}
  .vbtn:not(.on){background:#fff}
  .sev.on{background:#171717;color:#fff;border-color:#171717}
  textarea,input[type=text]{width:100%;border:1px solid #d4d4d4;border-radius:6px;padding:7px 8px;font-size:13px;color:#111;background:#fff;outline:none}
  textarea:focus,input[type=text]:focus{border-color:#2563eb;box-shadow:0 0 0 2px rgba(37,99,235,.15)}
  textarea{min-height:76px;resize:vertical}
  .chips{display:flex;flex-wrap:wrap;gap:4px;border:1px solid #d4d4d4;border-radius:6px;padding:4px;min-height:34px;align-items:center}
  .chips input{border:0!important;box-shadow:none!important;flex:1;min-width:90px;padding:3px 4px}
  .chip{display:inline-flex;align-items:center;gap:4px;background:#f5f5f5;border-radius:4px;padding:2px 6px;font-size:12px}
  .chip button{all:unset;cursor:pointer;color:#737373}
  .sugg{display:flex;flex-wrap:wrap;gap:4px;margin-top:6px}
  .sugg button{all:unset;cursor:pointer;font-size:11px;padding:2px 6px;border-radius:4px;border:1px dashed #d4d4d4;color:#525252}
  .sugg button:hover{background:#f5f5f5}
  .item{display:flex;gap:8px;padding:8px 12px;border-bottom:1px solid #f0f0f0;cursor:pointer}
  .item:hover{background:#fafafa}
  .item img{width:72px;height:54px;object-fit:cover;object-position:top;border:1px solid #e5e5e5;border-radius:4px;flex:none;background:#f5f5f5}
  .item .ph{width:72px;height:54px;border:1px dashed #d4d4d4;border-radius:4px;flex:none;display:flex;align-items:center;justify-content:center;font-size:10px;color:#a3a3a3}
  .dot{display:inline-block;width:18px;height:18px;border-radius:9px;color:#fff;font:600 10px/18px system-ui;text-align:center;flex:none}
  .help{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);background:#fff;color:#171717;border-radius:10px;padding:16px 20px;box-shadow:0 12px 40px rgba(0,0,0,.35);font-size:13px;min-width:300px}
  .help h4{margin:0 0 10px;font-size:14px}.help table{border-collapse:collapse;width:100%}.help td{padding:3px 6px}
  kbd{display:inline-block;min-width:12px;text-align:center;font:600 10px ui-monospace,monospace;border:1px solid currentColor;border-radius:3px;padding:0 3px;margin-left:3px;opacity:.6;line-height:14px}
  .help kbd{font-size:12px;min-width:18px;padding:1px 5px;opacity:1;border-color:#d4d4d4;border-bottom-width:2px;background:#fafafa}
  .st{font-size:11px;color:#737373;font-weight:400;text-transform:none;letter-spacing:0}
  .toast{position:fixed;left:50%;bottom:64px;transform:translateX(-50%);background:#111;color:#fff;padding:8px 12px;border-radius:6px;font-size:13px;pointer-events:none;box-shadow:0 4px 16px rgba(0,0,0,.35)}
  .kbd{font:11px ui-monospace,Menlo,monospace;background:#f5f5f5;border:1px solid #e5e5e5;border-radius:3px;padding:0 4px}
  `;

  // ------------------------------------------------------------------ DOM scaffolding (shadow root isolates from site CSS)
  const host = document.createElement('div');
  host.id = '__sloplabel';
  host.style.cssText = 'all:initial;position:fixed;inset:0;pointer-events:none;z-index:2147483647';
  document.documentElement.appendChild(host);
  const root = host.attachShadow({ mode: 'open' });
  root.innerHTML = `<style>${STYLE}</style>
    <div class="outline hov" hidden></div><div class="outline sel" hidden></div><div class="outline flash" hidden></div>
    <div class="tip" hidden></div><div class="pins"></div>
    <div class="bar"></div><div class="card panel" hidden></div><div class="card drawer" hidden></div><div class="toast" hidden></div>`;
  const $ = (s) => root.querySelector(s);
  const hovBox = $('.outline.hov'), selBox = $('.outline.sel'), flashBox = $('.outline.flash');
  const tip = $('.tip'), pinsLayer = $('.pins'), bar = $('.bar'), panel = $('.panel'), drawer = $('.drawer'), toastEl = $('.toast');
  const help = document.createElement('div'); help.className = 'help'; help.hidden = true; root.appendChild(help);
  const pageStyle = document.createElement('style');
  pageStyle.textContent = 'html.__slop-picking, html.__slop-picking *{cursor:crosshair!important}';
  document.head.appendChild(pageStyle);
  ['keydown', 'keyup', 'keypress'].forEach((t) => host.addEventListener(t, (e) => e.stopPropagation()));

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const api = async (path, opts = {}) => {
    const r = await fetch(API + path, { headers: { 'Content-Type': 'application/json' }, ...opts });
    if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
    return r.json();
  };
  let toastTimer;
  const toast = (msg) => { toastEl.textContent = msg; toastEl.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => (toastEl.hidden = true), 2600); };

  // ------------------------------------------------------------------ element identity helpers
  const LOC = 'data-source-loc';
  const isOurs = (e) => e.composedPath().includes(host);
  function parseLoc(loc) {
    if (!loc) return null;
    const m = loc.match(/^(.*?):(\d+)(?::(\d+))?$/);
    const file = m ? m[1] : loc;
    return { file, base: file.split('/').pop().replace(/\.(t|j)sx?$/, ''), line: m ? +m[2] : null };
  }
  function normalize(el) {
    if (el && el.nodeType !== 1) el = el.parentElement;
    if (!el || el === document.documentElement || el === document.body || host.contains(el)) return null;
    const svg = el.closest && el.closest('svg');
    return svg && svg !== el ? svg : el;
  }
  function chain(el) {
    const anc = [];
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) anc.unshift(n);
    const out = []; let prev = null;
    for (const n of anc) {
      const p = parseLoc(n.getAttribute(LOC));
      if (p && p.file !== prev) { out.push({ name: p.base, loc: n.getAttribute(LOC), el: n }); prev = p.file; }
    }
    return out;
  }
  function nameOf(el) {
    const p = parseLoc(el.getAttribute(LOC));
    if (p) return `${p.base}:${p.line} <${el.localName}>`;
    const cls = [...el.classList].slice(0, 2).join('.');
    return `<${el.localName}${cls ? '.' + cls.slice(0, 40) : ''}>`;
  }
  const count = (s) => { try { return document.querySelectorAll(s).length; } catch (_) { return 0; } };
  const locSel = (loc) => `[${LOC}="${CSS.escape(loc)}"]`;
  function selectorFor(el) {
    if (el.id && count('#' + CSS.escape(el.id)) === 1) return ['#' + CSS.escape(el.id), 'high'];
    const loc = el.getAttribute(LOC);
    if (loc && count(locSel(loc)) === 1) return [locSel(loc), 'high'];
    const parts = [];
    for (let n = el, depth = 0; n && n.nodeType === 1 && n !== document.documentElement && depth < 10; n = n.parentElement, depth++) {
      if (n.id && count('#' + CSS.escape(n.id)) === 1) { parts.unshift('#' + CSS.escape(n.id)); const s = parts.join(' > '); if (count(s) === 1) return [s, 'medium']; break; }
      const l = n.getAttribute(LOC);
      let part = l ? `${n.localName}${locSel(l)}` : n.localName;
      const par = n.parentElement;
      if (par) { const sib = [...par.children].filter((c) => c.localName === n.localName); if (sib.length > 1) part += `:nth-of-type(${sib.indexOf(n) + 1})`; }
      parts.unshift(part);
      const s = parts.join(' > ');
      if (count(s) === 1) return [s, depth < 3 ? 'medium' : 'low'];
    }
    return [parts.join(' > '), 'low'];
  }
  function describe(el) {
    const r = el.getBoundingClientRect(), cs = getComputedStyle(el), loc = el.getAttribute(LOC);
    const ch = chain(el), [selector, conf] = selectorFor(el);
    return {
      site_id: SITE, page_path: location.pathname + location.search + location.hash,
      viewport_w: innerWidth, viewport_h: innerHeight, scroll_y: scrollY,
      loc, loc_index: loc ? [...document.querySelectorAll(locSel(loc))].indexOf(el) : null,
      component: ch.length ? ch[ch.length - 1].name : null, component_chain: ch.map((c) => ({ name: c.name, loc: c.loc })),
      selector, selector_confidence: conf, tag: el.localName,
      text: (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 600),
      rect: { left: r.left, top: r.top, width: r.width, height: r.height, page_top: r.top + scrollY },
      styles: {
        fontFamily: cs.fontFamily, fontSize: cs.fontSize, fontWeight: cs.fontWeight, fontStyle: cs.fontStyle,
        letterSpacing: cs.letterSpacing, textTransform: cs.textTransform, color: cs.color, backgroundColor: cs.backgroundColor,
        backgroundImage: cs.backgroundImage.slice(0, 400), backdropFilter: cs.backdropFilter || cs.webkitBackdropFilter,
        borderRadius: cs.borderRadius, boxShadow: cs.boxShadow.slice(0, 300), opacity: cs.opacity, display: cs.display, position: cs.position,
      },
      html: el.outerHTML.slice(0, 5000),
    };
  }
  function findEl(l) {
    if (l.loc) { const all = document.querySelectorAll(locSel(l.loc)); const e = all[l.loc_index] || (all.length === 1 ? all[0] : null); if (e) return e; }
    if (l.selector) { try { return document.querySelector(l.selector); } catch (_) {} }
    return null;
  }
  const onThisPage = (l) => { try { return new URL(l.page_path || '/', location.origin).pathname === location.pathname; } catch (_) { return true; } };

  // ------------------------------------------------------------------ state
  const S = {
    picking: false, base: null, cur: null, stack: [], sel: null, editing: null, form: null,
    labels: [], tags: [], site: null, showPins: true, drawerOpen: false,
    annotator: localStorage.getItem('__slop_annotator') || '',
    panelPos: JSON.parse(localStorage.getItem('__slop_panelpos') || 'null'), panelMin: false,
  };
  const pinEls = new Map(), markEls = new Map(), elCache = new Map();

  // ------------------------------------------------------------------ toolbar
  function renderBar() {
    const n = S.labels.length;
    bar.innerHTML = `
      <span class="site" title="${esc(CFG.title)} — ${esc(CFG.model)}"><b>${esc(SITE)}</b> ${esc(CFG.title)}</span>
      <button data-a="pick" class="${S.picking ? 'on' : ''}" title="Toggle pick mode (Q)">${S.picking ? 'Picking… (Esc)' : 'Pick element'}<kbd>Q</kbd></button>
      <button data-a="drawer" class="${S.drawerOpen ? 'on' : ''}" title="Labels drawer (A)">Labels (${n})<kbd>A</kbd></button>
      <button data-a="pins" title="Hide/show pins (H)">${S.showPins ? 'Hide pins' : 'Show pins'}<kbd>H</kbd></button>
      <button data-a="help" title="Keyboard shortcuts (?)">Keys<kbd>?</kbd></button>
      <button data-a="view">${IN_FRAME ? 'Desktop view' : 'Mobile view'}</button>
      <button data-a="home">All sites</button>`;
  }
  bar.addEventListener('click', (e) => {
    const a = e.target.closest('button')?.dataset.a;
    if (a === 'pick') setPicking(!S.picking);
    if (a === 'drawer') toggleDrawer();
    if (a === 'pins') { S.showPins = !S.showPins; renderBar(); }
    if (a === 'help') toggleHelp();
    if (a === 'view') window.top.location.href = `/__slop/open/${SITE}?view=${IN_FRAME ? 'desktop' : 'mobile'}`;
    if (a === 'home') window.top.location.href = '/__slop/';
  });

  // ------------------------------------------------------------------ pick mode
  function setPicking(v) {
    S.picking = v; S.base = S.cur = null; S.stack = [];
    document.documentElement.classList.toggle('__slop-picking', v);
    if (!v) { hovBox.hidden = true; tip.hidden = true; }
    renderBar();
  }
  const swallow = (e) => { if (S.picking && !isOurs(e)) { e.preventDefault(); e.stopImmediatePropagation(); } };
  ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'touchstart', 'touchend', 'submit', 'dblclick', 'contextmenu'].forEach((t) => window.addEventListener(t, swallow, { capture: true, passive: false }));
  window.addEventListener('click', (e) => {
    if (!S.picking || isOurs(e)) return;
    e.preventDefault(); e.stopImmediatePropagation();
    const el = S.cur || normalize(e.target);
    if (el) toggleAt(el);
  }, true);
  window.addEventListener('pointermove', (e) => {
    if (!S.picking || isOurs(e)) return;
    const el = normalize(document.elementFromPoint(e.clientX, e.clientY) || e.target);
    if (el && el !== S.base) { S.base = S.cur = el; S.stack = []; drawTip(e.clientX, e.clientY); }
    else if (el) drawTip(e.clientX, e.clientY);
  }, true);
  function climb(dir, toComponent) {
    const target = S.picking && !S.sel ? 'cur' : (S.sel && S.P && S.P.fresh ? 'sel' : null);
    if (!target) return;
    const el = S[target];
    if (!el) return;
    let next = null;
    if (dir > 0) {
      if (toComponent) {
        const ch = chain(el).filter((c) => c.el !== el && c.el.contains(el));
        next = ch.length ? ch[ch.length - 1].el : null;
      } else next = el.parentElement;
      if (next && next !== document.body && next !== document.documentElement) { S.stack.push(el); S[target] = next; }
    } else if (S.stack.length) S[target] = S.stack.pop();
    if (target === 'sel') { retarget(); renderPanel(); } else drawTip();
  }
  let lastTipXY = [0, 0];
  function drawTip(x, y) {
    if (x !== undefined) lastTipXY = [x, y];
    const el = S.cur; if (!el) return;
    const ch = chain(el).map((c) => c.name);
    const r = el.getBoundingClientRect();
    tip.innerHTML = `<div class="crumbs">${esc(ch.join(' › ') || '(no source map)')}</div>
      <div class="main">${esc(nameOf(el))} · ${Math.round(r.width)}×${Math.round(r.height)}</div>
      <div class="keys">click label · W parent · S child · E component · esc exit</div>`;
    tip.hidden = false;
    const [tx, ty] = lastTipXY;
    const tw = tip.offsetWidth, th = tip.offsetHeight;
    tip.style.left = Math.min(Math.max(tx + 14, 4), innerWidth - tw - 4) + 'px';
    tip.style.top = (ty + th + 24 > innerHeight ? ty - th - 12 : ty + 18) + 'px';
  }
  const KEYS = [['Q', 'Pick mode on/off'], ['W', 'Select parent element'], ['S', 'Back to child'], ['E', 'Jump to enclosing component'],
    ['A', 'Labels drawer'], ['D', 'Delete current label'], ['F', 'Focus comment box'], ['R', 'Minimize / expand panel'],
    ['H', 'Hide / show pins'], ['Esc', 'Close panel (label stays)'], ['Ctrl+Enter', 'Done (close panel)'], ['?', 'This cheat sheet']];
  function toggleHelp(v) {
    help.hidden = v === undefined ? !help.hidden : !v;
    if (!help.hidden) help.innerHTML = `<h4>SlopLabel shortcuts</h4><table>${KEYS.map(([k, d]) => `<tr><td><kbd>${k}</kbd></td><td>${d}</td></tr>`).join('')}</table>
      <div class="muted" style="margin-top:10px;font-size:12px">Letter keys are ignored while you type. ↑/↓ arrows also work for W/S.</div>`;
  }
  function toggleDrawer() { S.drawerOpen = !S.drawerOpen; if (S.drawerOpen) { closePanel(); renderDrawer(); } drawer.hidden = !S.drawerOpen; renderBar(); }
  window.addEventListener('keydown', (e) => {
    const typing = isOurs(e) && /^(INPUT|TEXTAREA)$/.test((e.composedPath()[0] || {}).tagName || '');
    const eat = () => { e.preventDefault(); e.stopImmediatePropagation(); };
    if ((e.altKey && e.shiftKey && e.code === 'KeyP') || (e.key === '`' && !typing && !isEditable(e))) { eat(); setPicking(!S.picking); return; }
    if (e.key === 'Escape') {
      if (!help.hidden) { eat(); toggleHelp(false); return; }
      if (!panel.hidden) { eat(); closePanel(); return; }
      if (S.picking) { eat(); setPicking(false); return; }
      if (S.drawerOpen) { toggleDrawer(); return; }
    }
    if (typing || isEditable(e)) return;
    const canClimb = S.picking || (S.sel && S.P && S.P.fresh);
    if (canClimb && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) { eat(); climb(e.key === 'ArrowUp' ? 1 : -1, e.shiftKey); return; }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key.toLowerCase();
    if (e.key === '?') { eat(); toggleHelp(); }
    else if (k === 'q') { eat(); setPicking(!S.picking); }
    else if (k === 'w' && canClimb) { eat(); climb(1, false); }
    else if (k === 's' && canClimb) { eat(); climb(-1, false); }
    else if (k === 'e' && canClimb) { eat(); climb(1, true); }
    else if (k === 'a') { eat(); toggleDrawer(); }
    else if (k === 'h') { eat(); S.showPins = !S.showPins; renderBar(); }
    else if (k === 'r' && !panel.hidden) { eat(); S.panelMin = !S.panelMin; renderPanel(); }
    else if (k === 'f' && !panel.hidden) { eat(); if (S.panelMin) { S.panelMin = false; renderPanel(); } panel.querySelector('textarea')?.focus(); }
    else if (k === 'd' && !panel.hidden) { eat(); delCurrent(); }
  }, true);
  const isEditable = (e) => { const t = e.target; return t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)); };

  // ------------------------------------------------------------------ label panel
  // Autosave: picking an element creates the row immediately, edits PUT on a debounce,
  // and closing the panel with an empty comment deletes the row.
  function openPanel(el, label) {
    if (S.P) finalize(S.P);
    if (!S.annotator) S.annotator = localStorage.getItem('__slop_annotator') || '';
    const P = S.P = { label, el, comment: label ? label.comment || '' : '', fresh: !label, dirty: false, retarget: false, timer: null, creating: null, status: label ? 'Saved' : 'Saving…' };
    S.sel = el; S.stack = [];
    S.form = P;
    if (!label) {
      P.creating = api('/labels', { method: 'POST', body: JSON.stringify({ ...describe(el), comment: '', annotator: S.annotator }) })
        .then((l) => { P.label = l; if (!P.closed) { S.labels.push(l); renderBar(); setStatus(P, P.dirty ? 'Editing…' : 'Saved'); } return l; })
        .catch((err) => { toast('Save failed: ' + err.message); setStatus(P, 'Not saved'); return null; });
    }
    hovBox.hidden = true; tip.hidden = true;
    S.drawerOpen = false; drawer.hidden = true;
    panel.hidden = false; renderPanel(); renderBar();
    if (mobile()) { const r = el.getBoundingClientRect(); if (r.top < 0 || r.top > innerHeight * 0.3) scrollBy({ top: r.top - 56, behavior: 'smooth' }); }
  }
  const mobile = () => innerWidth <= 640;
  function positionPanel() {
    if (panel.hidden) return;
    panel.classList.toggle('min', !!S.panelMin);
    const st = panel.style;
    if (S.panelPos && !mobile()) {
      const w = panel.offsetWidth;
      Object.assign(st, { left: Math.min(Math.max(S.panelPos.x, 0), innerWidth - w) + 'px', top: Math.min(Math.max(S.panelPos.y, 0), innerHeight - 40) + 'px', right: 'auto', bottom: 'auto' });
      panel.classList.remove('left'); return;
    }
    st.left = st.top = st.right = st.bottom = '';
    const r = S.sel && S.sel.getBoundingClientRect();
    panel.classList.toggle('left', !!r && !mobile() && r.left + r.width / 2 > innerWidth / 2);
  }
  panel.addEventListener('pointerdown', (e) => {
    const hdr = e.target.closest('.hdr');
    if (!hdr || e.target.closest('button') || mobile() || e.button !== 0) return;
    e.preventDefault();
    const r = panel.getBoundingClientRect(), ox = e.clientX - r.left, oy = e.clientY - r.top;
    const mv = (ev) => { S.panelPos = { x: ev.clientX - ox, y: ev.clientY - oy }; positionPanel(); };
    const up = () => {
      window.removeEventListener('pointermove', mv, true); window.removeEventListener('pointerup', up, true);
      if (S.panelPos) { localStorage.setItem('__slop_panelpos', JSON.stringify(S.panelPos)); renderPanel(); }
    };
    window.addEventListener('pointermove', mv, true); window.addEventListener('pointerup', up, true);
  });
  window.addEventListener('resize', positionPanel);
  function setStatus(P, txt) {
    P.status = txt;
    if (S.P !== P) return;
    const st = panel.querySelector('.st'); if (st) st.textContent = P.status;
    const t = panel.querySelector('.ttl'); if (t) t.textContent = titleOf(P);
  }
  const labelNo = (l) => (l ? S.labels.findIndex((x) => x.id === l.id) + 1 : 0);
  const titleOf = (P) => (P.label && labelNo(P.label) ? `Label #${labelNo(P.label)}` : 'New label');
  function queueSave(P = S.P) {
    if (!P) return;
    P.dirty = true; setStatus(P, 'Editing…');
    clearTimeout(P.timer); P.timer = setTimeout(() => flush(P), 600);
  }
  function retarget() { if (S.P) { S.P.retarget = true; S.P.el = S.sel; queueSave(); } }
  async function flush(P, keepalive = false) {
    clearTimeout(P.timer);
    if (!P.dirty) return;
    const l = P.label || await P.creating; if (!l) return;
    P.dirty = false;
    const body = { comment: P.comment, annotator: S.annotator };
    if (P.retarget && P.el) Object.assign(body, describe(P.el), { retarget: true, comment: P.comment, annotator: S.annotator });
    P.retarget = false;
    if (S.annotator) localStorage.setItem('__slop_annotator', S.annotator);
    setStatus(P, 'Saving…');
    try {
      const nl = await api(`/labels/${l.id}`, { method: 'PUT', body: JSON.stringify(body), keepalive });
      P.label = nl; const i = S.labels.findIndex((x) => x.id === nl.id); if (i >= 0) S.labels[i] = nl;
      if (body.retarget) elCache.delete(nl.id);
      setStatus(P, P.dirty ? 'Editing…' : 'Saved');
    } catch (err) {
      P.dirty = true; if (body.retarget) P.retarget = true;
      setStatus(P, 'Save failed, retrying'); P.timer = setTimeout(() => flush(P), 3000);
    }
  }
  // Clicking an already-labeled element: an uncommented label is removed (unclick), a commented one reopens.
  async function toggleAt(el) {
    const P = S.P;
    let l = P && P.el === el && S.sel === el ? (P.label || await P.creating) : null;
    if (!l) l = S.labels.find((x) => { const e = elCache.get(x.id); return e && e === el; });
    if (!l) { openPanel(el, null); return; }
    if ((l.comment || '').trim() || (P && P.label && P.label.id === l.id && P.comment.trim())) {
      if (!(P && P.label && P.label.id === l.id)) openPanel(el, l);
      return;
    }
    if (P && P.label && P.label.id === l.id) { P.closed = true; clearTimeout(P.timer); S.P = null; closePanel(); }
    S.labels = S.labels.filter((x) => x.id !== l.id); renderBar();
    await api(`/labels/${l.id}`, { method: 'DELETE' }).catch(() => {});
    toast('Label removed'); loadLabels();
  }
  async function finalize(P, keepalive = false) {
    if (P.closed) return; P.closed = true;
    clearTimeout(P.timer);
    const l = P.label || await P.creating; if (!l) return;
    if (P.dirty || P.retarget) { P.dirty = true; await flush(P, keepalive); }
    if (!keepalive) loadLabels();
  }
  async function delCurrent() {
    const P = S.P; if (!P) return;
    if (P.comment.trim() && !confirm('Delete this label?')) return;
    P.closed = true; clearTimeout(P.timer); S.P = null;
    const l = P.label || await P.creating;
    if (l) await api(`/labels/${l.id}`, { method: 'DELETE' }).catch(() => {});
    closePanel(); await loadLabels(); toast('Label deleted');
  }
  window.addEventListener('pagehide', () => { if (S.P) finalize(S.P, true); });
  function closePanel() {
    if (S.P) { finalize(S.P); S.P = null; }
    S.sel = null; S.form = null; panel.hidden = true; selBox.hidden = true;
  }
  function renderPanel() {
    const el = S.sel, f = S.form; if (!el || !f) return;
    const ch = chain(el), r = el.getBoundingClientRect(), loc = el.getAttribute(LOC);
    const P = S.P, fresh = P.fresh;
    panel.innerHTML = `
      <div class="sec">
        <div class="row hdr" style="justify-content:space-between" title="Drag to move"><div class="h" style="margin:0">⠿ <span class="ttl">${titleOf(P)}</span> · <span class="st">${esc(P.status)}</span></div>
          <span class="row" style="gap:4px">${S.panelPos ? '<button class="btn sm" data-a="dock" title="Return to auto placement">Dock</button>' : ''}<button class="btn sm" data-a="min">${S.panelMin ? 'Expand' : 'Minimize'}</button><button class="btn sm" data-a="close">Close</button></span></div>
        <div class="detail">
        <div class="row" style="margin-top:8px;gap:3px">${ch.map((c, i) => `<button class="crumb ${c.el === el ? 'cur' : ''}" data-crumb="${i}" ${fresh ? '' : 'disabled'}>${esc(c.name)}</button><span class="sep">›</span>`).join('')}
          <span class="crumb cur">&lt;${esc(el.localName)}&gt;</span></div>
        <div class="mono muted" style="margin-top:6px">${esc(loc || selectorFor(el)[0])} · ${Math.round(r.width)}×${Math.round(r.height)}</div>
        <div class="muted" style="margin-top:4px;max-height:36px;overflow:hidden">${esc((el.innerText || '').trim().slice(0, 140))}</div>
        ${!fresh ? '' : `<div class="row" style="margin-top:8px"><button class="btn sm" data-a="up">↑ Parent<kbd>W</kbd></button><button class="btn sm" data-a="down" ${S.stack.length ? '' : 'disabled'}>↓ Child<kbd>S</kbd></button><button class="btn sm" data-a="comp">⇧ Component</button></div>`}
      </div></div>
      <div class="sec"><div class="h">Why is this slop?</div><textarea placeholder="Click or press F to type. e.g. gradient headline + pill badge, same template as every other hero">${esc(f.comment)}</textarea></div>
      <div class="sec">
        ${S.annotator ? `<div class="muted" style="font-size:12px;margin-bottom:8px">Labeling as <b>${esc(S.annotator)}</b> · <a href="#" data-a="who">change</a></div>`
                      : `<div class="h">Your name</div><input type="text" class="who" placeholder="e.g. Katie" style="margin-bottom:8px">`}
        <div class="row"><button class="btn primary" data-a="close" style="flex:1">Done<kbd>Esc</kbd></button>
          <button class="btn danger" data-a="del">Delete<kbd>D</kbd></button></div>
        <div class="muted" style="font-size:11px;margin-top:6px">Saved as slop · comment optional, autosaves as you type · click the element again to unlabel (if no comment)</div>
      </div>`;
    positionPanel();
  }
  panel.addEventListener('click', async (e) => {
    const b = e.target.closest('button, a'); if (!b) return;
    const d = b.dataset;
    if (b.tagName === 'A') e.preventDefault();
    if (d.crumb !== undefined && S.P && S.P.fresh) { const c = chain(S.sel)[+d.crumb]; if (c && c.el !== S.sel) { S.stack.push(S.sel); S.sel = c.el; retarget(); renderPanel(); } }
    else if (d.a === 'close') closePanel();
    else if (d.a === 'min') { S.panelMin = !S.panelMin; renderPanel(); }
    else if (d.a === 'dock') { S.panelPos = null; localStorage.removeItem('__slop_panelpos'); renderPanel(); }
    else if (d.a === 'up') climb(1, false);
    else if (d.a === 'down') climb(-1, false);
    else if (d.a === 'comp') climb(1, true);
    else if (d.a === 'who') { S.annotator = ''; renderPanel(); }
    else if (d.a === 'del') delCurrent();
  });
  panel.addEventListener('input', (e) => {
    if (e.target.tagName === 'TEXTAREA') { S.P.comment = e.target.value; queueSave(); }
    if (e.target.classList.contains('who')) { S.annotator = e.target.value.trim(); queueSave(); }
  });
  panel.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); closePanel(); return; }
  });

  // ------------------------------------------------------------------ drawer: label list + site overall
  function renderDrawer() {
    const s = S.site || {};
    const items = S.labels.map((l, i) => `
      <div class="item" data-id="${l.id}">
        ${l.shot_url ? `<img src="${l.shot_url}?t=${l.updated_at}" loading="lazy">` : `<div class="ph">${l.shot_status === 'pending' ? 'capturing…' : 'no shot'}</div>`}
        <div style="min-width:0;flex:1">
          <div class="row" style="gap:6px"><span class="dot slop">${i + 1}</span><span class="mono" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(l.component || l.tag)}${l.loc ? ':' + esc(parseLoc(l.loc).line) : ''} &lt;${esc(l.tag)}&gt;</span></div>
          <div style="margin-top:3px;font-size:12px">${(l.categories || []).map((t) => `<span class="chip" style="margin:0 3px 3px 0">${esc(t)}</span>`).join('')}</div>
          <div class="muted" style="font-size:12px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">${esc(l.comment)}</div>
          ${onThisPage(l) ? '' : `<div class="muted" style="font-size:11px">on ${esc(l.page_path)}</div>`}
        </div></div>`).join('');
    drawer.innerHTML = `
      <div class="sec"><div class="row" style="justify-content:space-between"><div class="h" style="margin:0">${esc(SITE)} · ${esc(CFG.title)}</div><button class="btn sm" data-a="close">Close</button></div>
        <div class="muted" style="font-size:12px;margin-top:2px">${esc(CFG.model)} · arena placement ${esc(CFG.placement)}</div></div>
      <div class="sec"><div class="h">Site overall</div>
        <div class="row"><span class="muted" style="font-size:12px">Slop score</span>${[1, 2, 3, 4, 5].map((n) => `<button class="btn sm sev ${s.overall_score === n ? 'on' : ''}" data-os="${n}">${n}</button>`).join('')}<span class="muted" style="font-size:11px">5 = pure slop</span></div>
        <textarea data-oc placeholder="Overall comment on this site" style="margin-top:8px;min-height:56px">${esc(s.overall_comment || '')}</textarea>
        <label class="row" style="margin-top:8px;font-size:12px;cursor:pointer"><input type="checkbox" data-done ${s.done ? 'checked' : ''}> Done labeling this site</label>
      </div>
      <div>${items || '<div class="sec muted">No labels yet. Click <b>Pick element</b> (or press <span class="kbd">Q</span>) and click any part of the page.</div>'}</div>`;
  }
  const patchSite = async (body) => { S.site = await api(`/sites/${SITE}`, { method: 'PATCH', body: JSON.stringify(body) }); };
  drawer.addEventListener('click', async (e) => {
    const b = e.target.closest('button'); const it = e.target.closest('.item');
    if (b?.dataset.a === 'close') { S.drawerOpen = false; drawer.hidden = true; renderBar(); return; }
    if (b?.dataset.os) { await patchSite({ overall_score: +b.dataset.os }); renderDrawer(); return; }
    if (it) focusLabel(S.labels.find((l) => l.id === +it.dataset.id));
  });
  drawer.addEventListener('change', async (e) => {
    if (e.target.matches('[data-done]')) await patchSite({ done: e.target.checked ? 1 : 0 });
    if (e.target.matches('[data-oc]')) { await patchSite({ overall_comment: e.target.value }); toast('Saved site comment'); }
  });

  function focusLabel(l) {
    if (!l) return;
    if (!onThisPage(l)) { toast(`Label is on ${l.page_path}`); return; }
    const el = findEl(l);
    if (!el) { toast('Element not found on the page (it may be behind an interaction)'); return; }
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    const until = performance.now() + 1400;
    const fl = () => { place(flashBox, el); flashBox.hidden = performance.now() > until; if (!flashBox.hidden) requestAnimationFrame(fl); };
    fl();
    setTimeout(() => openPanel(el, l), 500);
  }

  // ------------------------------------------------------------------ pins + render loop
  function place(box, el) {
    const r = el.getBoundingClientRect();
    Object.assign(box.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
  }
  let lastFind = 0;
  function loop(t) {
    if (S.picking && S.cur && S.cur !== S.sel) { place(hovBox, S.cur); hovBox.hidden = false; } else hovBox.hidden = true;
    if (S.sel && S.sel.isConnected) {
      place(selBox, S.sel); selBox.hidden = false;
      const P = S.P, n = P && labelNo(P.label);
      selBox.dataset.badge = !P ? '' : P.label ? `SLOP #${n || ''} · saved` : 'SLOP · saving…';
    } else selBox.hidden = true;
    const editingId = S.P && S.P.label && S.P.label.id;
    const refind = t - lastFind > 1000; if (refind) lastFind = t;
    const seen = new Set();
    S.labels.forEach((l, i) => {
      seen.add(l.id);
      let pin = pinEls.get(l.id);
      if (!pin) { pin = document.createElement('div'); pin.dataset.id = l.id; pinsLayer.appendChild(pin); pinEls.set(l.id, pin); }
      pin.className = 'pin slop'; pin.textContent = i + 1;
      let mark = markEls.get(l.id);
      if (!mark) { mark = document.createElement('div'); mark.className = 'mark'; pinsLayer.prepend(mark); markEls.set(l.id, mark); }
      pin.title = `${l.component || l.tag}\n${l.comment || ''}`;
      let el = elCache.get(l.id);
      if ((!el || !el.isConnected) && refind) { el = onThisPage(l) ? findEl(l) : null; elCache.set(l.id, el); }
      const r = el && el.isConnected ? el.getBoundingClientRect() : null;
      const vis = S.showPins && r && r.width > 0 && r.bottom > 0 && r.top < innerHeight;
      pin.hidden = !vis;
      mark.hidden = !vis || l.id === editingId;
      if (vis) place(mark, el);
      if (vis) { pin.style.left = Math.max(r.left, 4) + 'px'; pin.style.top = Math.max(r.top, 12) + 'px'; }
    });
    for (const [id, pin] of pinEls) if (!seen.has(id)) { pin.remove(); pinEls.delete(id); markEls.get(id)?.remove(); markEls.delete(id); elCache.delete(id); }
    requestAnimationFrame(loop);
  }
  pinsLayer.addEventListener('click', (e) => { const p = e.target.closest('.pin'); if (p) focusLabel(S.labels.find((l) => l.id === +p.dataset.id)); });
  pinsLayer.addEventListener('mouseover', (e) => { const p = e.target.closest('.pin'); const el = p && elCache.get(+p.dataset.id); if (el && !S.sel) { place(flashBox, el); flashBox.hidden = false; } });
  pinsLayer.addEventListener('mouseout', () => { flashBox.hidden = true; });

  // ------------------------------------------------------------------ data
  async function loadLabels() {
    S.labels = await api(`/labels?site=${encodeURIComponent(SITE)}`);
    elCache.clear(); lastFind = 0;
    renderBar(); if (S.drawerOpen) renderDrawer();
    if (S.labels.some((l) => l.shot_status === 'pending')) setTimeout(loadLabels, 3000);
  }

  async function init() {
    renderBar();
    requestAnimationFrame(loop);
    try { [S.site] = await Promise.all([api(`/sites/${SITE}`), loadLabels()]); } catch (err) { toast('SlopLabel API error: ' + err.message); }
    const m = document.cookie.match(/(?:^|; )slop_focus=(\d+)/);
    if (m) {
      document.cookie = 'slop_focus=; Max-Age=0; path=/';
      setTimeout(() => focusLabel(S.labels.find((l) => l.id === +m[1])), 1500);
    }
  }
  init();
})();
