import { blob, grain, rand, smooth, svg } from "./common.mjs";

export const THEMES = {
  mossy: { sky: ["#f4dfa8", "#cfe0b4", "#9cc39a"], far: "#7fa67d", mid: "#4f7d4c", near: "#2f5634", ground: "#5e8a3a", leaf: ["#3f7a35", "#5f9a3a", "#77ad4a"], water: "#5ea5c9", flower: ["#fff8ec", "#f2c94c", "#e07aa5"], snow: false, trunk: "#5e3b1d" },
  frost: { sky: ["#e9f2f6", "#c5dceb", "#93bcd6"], far: "#a9c5d6", mid: "#6f97b0", near: "#3e6680", ground: "#e8f1f4", leaf: ["#3e6a66", "#4f7f78", "#6a9a92"], water: "#7fb6d6", flower: ["#ffffff", "#bfe3f5", "#9fc7e8"], snow: true, trunk: "#4a3828" },
  blossom: { sky: ["#fbe7dc", "#f3d0d6", "#c9dcb6"], far: "#d6b3c3", mid: "#7fa67d", near: "#4f7d4c", ground: "#78a64a", leaf: ["#e9a2bf", "#f3bfd3", "#d97aa4"], water: "#6fb3cf", flower: ["#fff8ec", "#f7c6d9", "#f2c94c"], snow: false, trunk: "#6b4426" },
  autumn: { sky: ["#f7d9a0", "#efb978", "#c98a5a"], far: "#c99a6a", mid: "#9a5b32", near: "#5e3a22", ground: "#a7742f", leaf: ["#d9662a", "#e8952c", "#b8432a"], water: "#5c94b0", flower: ["#f2c94c", "#e2812a", "#fff1d6"], snow: false, trunk: "#4a2f14" },
};

function treeLine(w, base, amp, color, seed, conifer, snow) {
  const r = rand(seed);
  let d = `M0,${base + 400}L0,${base}`;
  let x = 0;
  const caps = [];
  while (x < w + 60) {
    const tw = 40 + r() * 50, th = amp * (0.6 + r() * 0.6);
    if (conifer) {
      d += `L${x + tw * 0.5},${base - th}L${x + tw},${base}`;
      if (snow) caps.push(`M${x + tw * 0.5},${base - th}L${x + tw * 0.32},${base - th * 0.62}L${x + tw * 0.5},${base - th * 0.7}L${x + tw * 0.68},${base - th * 0.62}Z`);
    } else d += `Q${x + tw * 0.1},${base - th} ${x + tw * 0.5},${base - th}Q${x + tw * 0.9},${base - th} ${x + tw},${base}`;
    x += tw * 0.72;
  }
  d += `L${w},${base + 400}Z`;
  return `<path d="${d}" fill="${color}"/>${caps.length ? `<path d="${caps.join("")}" fill="#f6fbfd" opacity="0.9"/>` : ""}`;
}

export function roundTree(x, y, s, t, seed) {
  const r = rand(seed);
  let g = `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-14,0 Q-10,-80 -6,-150 L6,-150 Q10,-80 16,0Z" fill="${t.trunk}"/><path d="M-4,-120 L-40,-170 M4,-110 L38,-160" stroke="${t.trunk}" stroke-width="9" stroke-linecap="round"/>`;
  for (let i = 0; i < 6; i++) {
    const cx = (r() - 0.5) * 120, cy = -180 - r() * 90, rr = 55 + r() * 30;
    g += `<path d="${blob(cx, cy, rr, rr * 0.85, 0.3, seed + i, 10)}" fill="${t.leaf[i % 3]}"/>`;
  }
  for (let i = 0; i < 14; i++) g += `<circle cx="${((r() - 0.5) * 170).toFixed(0)}" cy="${(-150 - r() * 160).toFixed(0)}" r="${(5 + r() * 7).toFixed(0)}" fill="${t.leaf[(i + 1) % 3]}" opacity="0.9"/>`;
  if (t.snow) g += `<path d="${blob(0, -250, 80, 24, 0.3, seed + 9)}" fill="#f6fbfd"/>`;
  return g + "</g>";
}

export function conifer(x, y, s, t, seed) {
  const c = t.snow ? ["#2f5a58", "#3e6a66", "#4f7f78"] : ["#2f5634", "#3f7a35", "#4f8a3f"];
  let g = `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-8" y="-30" width="16" height="34" fill="${t.trunk}"/>`;
  for (let i = 0; i < 4; i++) {
    const yy = -30 - i * 55, ww = 90 - i * 18;
    g += `<path d="M${-ww},${yy} Q0,${yy - 20} ${ww},${yy} L0,${yy - 95}Z" fill="${c[i % 3]}"/>`;
    if (t.snow) g += `<path d="M${-ww * 0.6},${yy - 30} Q0,${yy - 42} ${ww * 0.6},${yy - 30} L0,${yy - 80}Z" fill="#f6fbfd" opacity="0.85"/>`;
  }
  return g + "</g>";
}

export function bush(x, y, s, t, seed, flowers = true) {
  const r = rand(seed);
  let g = `<g transform="translate(${x} ${y}) scale(${s})"><path d="${blob(0, -30, 80, 42, 0.35, seed, 12)}" fill="${t.snow ? "#3e6a66" : t.near}"/><path d="${blob(-14, -40, 58, 30, 0.35, seed + 1, 11)}" fill="${t.snow ? "#4f7f78" : t.leaf[0]}"/>`;
  if (flowers) for (let i = 0; i < 7; i++) g += `<circle cx="${((r() - 0.5) * 120).toFixed(0)}" cy="${(-20 - r() * 50).toFixed(0)}" r="${(4 + r() * 4).toFixed(1)}" fill="${t.flower[i % 3]}"/>`;
  if (t.snow) g += `<path d="${blob(-10, -66, 52, 12, 0.3, seed + 3)}" fill="#f6fbfd"/>`;
  return g + "</g>";
}

export function rock(x, y, s, seed, moss = "#6f9a43") {
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="${blob(0, -26, 60, 32, 0.3, seed, 10)}" fill="#8a8476"/><path d="${blob(-10, -36, 40, 18, 0.3, seed + 2, 9)}" fill="#a39d8e"/><path d="${blob(-6, -50, 34, 9, 0.4, seed + 5, 9)}" fill="${moss}"/></g>`;
}

export function fern(x, y, s, rot, color) {
  let g = `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M0,0 Q10,-120 0,-240" stroke="${color}" stroke-width="6" fill="none"/>`;
  for (let i = 1; i < 12; i++) {
    const yy = -i * 20, len = 70 - i * 5;
    g += `<path d="M${i % 2 ? 2 : 1},${yy} q${len * 0.5},-14 ${len},-4 q-${len * 0.5},4 -${len},14Z" fill="${color}"/><path d="M0,${yy} q-${len * 0.5},-14 -${len},-4 q${len * 0.5},4 ${len},14Z" fill="${color}"/>`;
  }
  return g + "</g>";
}

export function lantern(x, y, s) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-5" y="-160" width="10" height="160" fill="#5e3b1d"/><path d="M0,-160 Q30,-170 40,-150" stroke="#5e3b1d" stroke-width="7" fill="none"/><circle cx="40" cy="-118" r="36" fill="#ffd27a" opacity="0.25"/><path d="M40,-148 V-140" stroke="#3a2a1c" stroke-width="3"/><path d="M26,-140 H54 L50,-100 H30Z" fill="#ffd27a" stroke="#3a2a1c" stroke-width="4"/><path d="M24,-142 H56 L50,-150 H30Z" fill="#3a2a1c"/><rect x="28" y="-102" width="24" height="6" fill="#3a2a1c"/></g>`;
}

export function bridge(x, y, w, s = 1) {
  let planks = "";
  for (let i = 0; i <= 12; i++) {
    const px = (w / 12) * i, py = -Math.sin((i / 12) * Math.PI) * 40;
    planks += `<rect x="${px - 10}" y="${py - 8}" width="22" height="20" rx="3" fill="${i % 2 ? "#8f5c32" : "#a06a3a"}"/>`;
  }
  const rail = (o) => `<path d="M0,${o} Q${w / 2},${o - 80} ${w},${o}" stroke="#5e3b1d" stroke-width="7" fill="none"/>`;
  let posts = "";
  for (let i = 0; i <= 4; i++) {
    const px = (w / 4) * i, py = -Math.sin((i / 4) * Math.PI) * 40;
    posts += `<rect x="${px - 5}" y="${py - 50}" width="10" height="52" fill="#5e3b1d"/>`;
  }
  return `<g transform="translate(${x} ${y}) scale(${s})">${planks}${posts}${rail(-46)}</g>`;
}

export function signpost(x, y, s) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-6" y="-120" width="12" height="120" fill="#5e3b1d"/><path d="M-50,-112 H40 L56,-96 L40,-80 H-50Z" fill="#a06a3a" stroke="#4a2c14" stroke-width="4"/><path d="M-40,-96 H30" stroke="#6e4422" stroke-width="3"/><path d="M50,-68 H-40 L-56,-52 L-40,-36 H50Z" fill="#8f5c32" stroke="#4a2c14" stroke-width="4"/></g>`;
}

function waterfall(x, top, bottom, w, seed) {
  const r = rand(seed);
  let g = `<path d="M${x - w / 2},${top} Q${x},${top - 10} ${x + w / 2},${top} L${x + w / 2 + 20},${bottom} L${x - w / 2 - 20},${bottom}Z" fill="#a9d6ea"/>`;
  for (let i = 0; i < 18; i++) {
    const xx = x - w / 2 + r() * w;
    g += `<path d="M${xx.toFixed(0)},${top + r() * 40} L${(xx + (xx - x) * 0.08).toFixed(0)},${bottom - r() * 60}" stroke="#eaf7fd" stroke-width="${(2 + r() * 5).toFixed(1)}" opacity="${(0.4 + r() * 0.5).toFixed(2)}" stroke-linecap="round"/>`;
  }
  g += `<path d="${blob(x, bottom, w * 0.9, 34, 0.4, seed + 1, 12)}" fill="#f2fbff" opacity="0.85"/>`;
  return g;
}

/** Full illustrated woodland backdrop: sky, layered treelines, waterfall, river, bridge and foreground detail. */
export function landscape(w, h, key, opts = {}) {
  const t = THEMES[key];
  const r = rand(opts.seed ?? 7);
  const horizon = h * (opts.horizon ?? 0.42);
  const defs = `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.sky[0]}"/><stop offset="0.6" stop-color="${t.sky[1]}"/><stop offset="1" stop-color="${t.sky[2]}"/></linearGradient>
    <linearGradient id="riv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.water}" stop-opacity="0.85"/><stop offset="1" stop-color="#2f6f93"/></linearGradient>${grain("paper", 0.12, 0.7)}`;
  let g = `<rect width="${w}" height="${h}" fill="url(#sky)"/>`;
  g += `<circle cx="${w * 0.72}" cy="${h * 0.14}" r="${w * 0.09}" fill="#fff6d6" opacity="${t.snow ? 0.5 : 0.75}"/>`;
  for (let i = 0; i < 5; i++) g += `<path d="${blob(r() * w, h * (0.06 + r() * 0.16), 90 + r() * 80, 22 + r() * 10, 0.3, 50 + i, 10)}" fill="#fff" opacity="0.5"/>`;
  g += treeLine(w, horizon - h * 0.06, h * 0.12, t.far, 11, true, t.snow);
  const wx = w * (opts.fallX ?? 0.5);
  g += `<path d="M${wx - w * 0.3},${horizon + 20} Q${wx - w * 0.22},${horizon - h * 0.16} ${wx - w * 0.08},${horizon - h * 0.17} L${wx + w * 0.08},${horizon - h * 0.17} Q${wx + w * 0.24},${horizon - h * 0.15} ${wx + w * 0.32},${horizon + 20}Z" fill="${t.snow ? "#8fa9b8" : "#7c7466"}"/>`;
  g += `<path d="M${wx - w * 0.28},${horizon + 10} Q${wx - w * 0.2},${horizon - h * 0.14} ${wx - w * 0.07},${horizon - h * 0.16}" stroke="${t.snow ? "#f6fbfd" : t.leaf[1]}" stroke-width="18" fill="none" stroke-linecap="round"/>`;
  g += waterfall(wx, horizon - h * 0.165, horizon + h * 0.03, w * 0.1, 3);
  g += treeLine(w, horizon + h * 0.02, h * 0.1, t.mid, 23, !!t.snow || key === "mossy", t.snow);
  g += `<rect y="${horizon + h * 0.02}" width="${w}" height="${h}" fill="${t.ground}"/>`;
  const rw = w * 0.1;
  const river = smooth([
    [wx - rw, horizon + h * 0.03], [wx + rw, horizon + h * 0.03], [wx + rw * 1.8, horizon + h * 0.2], [w * 0.75, horizon + h * 0.38], [w * 0.9, h + 40], [w * 0.25, h + 40], [w * 0.38, horizon + h * 0.36], [wx - rw * 1.6, horizon + h * 0.18],
  ]);
  g += `<path d="${river}" fill="url(#riv)"/>`;
  for (let i = 0; i < 16; i++) {
    const yy = horizon + h * 0.06 + r() * (h - horizon), xx = wx + (r() - 0.5) * w * 0.3 + (yy - horizon) * 0.25;
    g += `<path d="M${xx.toFixed(0)},${yy.toFixed(0)} h${(30 + r() * 60).toFixed(0)}" stroke="#eaf7fd" stroke-width="4" opacity="0.55" stroke-linecap="round"/>`;
  }
  g += bridge(w * 0.34, horizon + h * 0.27, w * 0.36, w / 1080);
  const s = w / 1080;
  g += rock(wx - rw * 1.5, horizon + h * 0.1, s * 0.8, 31) + rock(wx + rw * 2, horizon + h * 0.16, s, 33);
  const trees = opts.trees ?? [[0.06, 0.62, 1.4], [0.94, 0.6, 1.5], [0.18, 0.5, 0.9], [0.84, 0.48, 0.85]];
  trees.forEach(([tx, ty, ts], i) => {
    g += (t.snow || (key === "mossy" && i % 2)) ? conifer(w * tx, h * ty, s * ts * 1.4, t, 70 + i) : roundTree(w * tx, h * ty, s * ts, t, 70 + i);
  });
  g += lantern(w * 0.24, horizon + h * 0.3, s * 1.1) + signpost(w * 0.8, horizon + h * 0.44, s * 1.2);
  for (let i = 0; i < 6; i++) g += bush(w * (i < 3 ? 0.05 + i * 0.12 : 0.62 + (i - 3) * 0.14), h * (0.86 + (i % 2) * 0.06), s * (1.2 + r() * 0.5), t, 90 + i);
  g += `<rect width="${w}" height="${h}" filter="url(#paper)" fill="#fff"/>`;
  return svg(w, h, g, defs);
}

export function foliageSide(w, h, side, key = "mossy") {
  const t = THEMES[key];
  let g = "";
  const flip = side === "right" ? `transform="translate(${w} 0) scale(-1 1)"` : "";
  g += `<g ${flip}>`;
  const cols = ["#2c5a28", "#3f7a35", "#4f8a3f", "#5f9a3a"];
  for (let i = 0; i < 9; i++) g += fern(-10, h * (0.1 + i * 0.1), 1.1 + (i % 3) * 0.2, 60 + (i % 3) * 14, cols[i % 4]);
  for (let i = 0; i < 6; i++) g += `<path d="${blob(20, h * (0.15 + i * 0.15), 90, 60, 0.4, 200 + i, 11)}" fill="${cols[(i + 1) % 4]}"/>`;
  for (let i = 0; i < 10; i++) g += `<circle cx="${40 + (i % 3) * 30}" cy="${h * (0.1 + i * 0.085)}" r="7" fill="${t.flower[i % 3]}"/>`;
  return svg(w, h, g + "</g>");
}

export function fernsBottom(w, h) {
  const cols = ["#2c5a28", "#3f7a35", "#4f8a3f"];
  let g = "";
  for (let i = 0; i < 16; i++) g += fern((w / 15) * i, h + 20, 0.9 + (i % 4) * 0.15, -50 + (i % 5) * 25, cols[i % 3]);
  g += `<path d="${blob(w / 2, h, w * 0.6, 50, 0.2, 5, 16)}" fill="#2c5a28"/>`;
  return svg(w, h, g);
}

/** Glass jar drawn in two layers so pebbles sit between the back wall and the front reflections. */
export const JAR = { w: 860, h: 1040, gridX: 80, gridY: 170, cell: 100 };
const jarBody = () => {
  const { w } = JAR;
  return `M60,120 Q60,104 76,104 L${w - 76},104 Q${w - 60},104 ${w - 60},120 L${w - 48},950 Q${w - 50},1010 ${w - 110},1012 L110,1012 Q50,1010 48,950Z`;
};

export function jarBack() {
  return svg(JAR.w, JAR.h, `<path d="${jarBody()}" fill="#d9eef6" opacity="0.28"/><path d="${jarBody()}" fill="none" stroke="#e9f7fc" stroke-width="10" opacity="0.4"/>
    <path d="M78,${JAR.gridY + 8} L${JAR.w - 78},${JAR.gridY + 8}" stroke="#ffffff" stroke-width="2" opacity="0.18"/>`);
}

export function jarFront() {
  const { w } = JAR;
  return svg(
    w,
    JAR.h,
    `<path d="${jarBody()}" fill="none" stroke="#f4fbfe" stroke-width="12" opacity="0.75"/>
     <path d="${jarBody()}" fill="none" stroke="#7fb3c8" stroke-width="3" opacity="0.7"/>
     <path d="M96,170 Q86,560 104,940" stroke="#ffffff" stroke-width="22" fill="none" opacity="0.32" stroke-linecap="round"/>
     <path d="M136,200 Q130,420 138,560" stroke="#ffffff" stroke-width="9" fill="none" opacity="0.4" stroke-linecap="round"/>
     <path d="M${w - 100},230 Q${w - 92},560 ${w - 108},900" stroke="#ffffff" stroke-width="10" fill="none" opacity="0.25" stroke-linecap="round"/>
     <path d="M140,996 Q${w / 2},1018 ${w - 140},996" stroke="#ffffff" stroke-width="6" fill="none" opacity="0.35"/>
     <rect x="40" y="60" width="${w - 80}" height="56" rx="20" fill="#e3f2f8" opacity="0.5" stroke="#f7fdff" stroke-width="6"/>
     <path d="M64,74 H${w - 64}" stroke="#fff" stroke-width="6" opacity="0.6" stroke-linecap="round"/>
     ${rope(w)}`,
  );
}

function rope(w) {
  let g = `<path d="M46,128 Q${w / 2},146 ${w - 46},128" stroke="#a8844f" stroke-width="18" fill="none"/>`;
  for (let i = 0; i < 34; i++) {
    const x = 52 + ((w - 104) / 33) * i, y = 128 + Math.sin((i / 33) * Math.PI) * 9;
    g += `<path d="M${x - 6},${y - 8} L${x + 6},${y + 8}" stroke="#7a5a30" stroke-width="3"/>`;
  }
  g += `<path d="M${w - 70},136 Q${w - 50},200 ${w - 76},250 M${w - 70},136 Q${w - 92},210 ${w - 62},270" stroke="#a8844f" stroke-width="12" fill="none" stroke-linecap="round"/>`;
  g += `<circle cx="${w - 70}" cy="136" r="16" fill="#8d6a3a"/>`;
  return g;
}

export function jarBase() {
  const w = 940, h = 150;
  let g = `<path d="M30,40 Q30,20 60,20 L${w - 60},20 Q${w - 30},20 ${w - 30},40 L${w - 50},120 Q${w - 56},140 ${w - 90},140 L90,140 Q56,140 50,120Z" fill="#8f5c32" stroke="#4a2c14" stroke-width="6"/>`;
  g += `<path d="M40,52 H${w - 40}" stroke="#6e4422" stroke-width="5"/><path d="M60,90 Q300,80 ${w - 60},96" stroke="#a87444" stroke-width="5" fill="none"/>`;
  g += `<path d="M120,112 Q340,104 ${w - 120},114" stroke="#6e4422" stroke-width="4" fill="none"/>`;
  for (const x of [80, w - 80]) g += `<circle cx="${x}" cy="72" r="9" fill="#3a2a1c"/>`;
  g += `<ellipse cx="${w / 2}" cy="78" rx="70" ry="22" fill="#a87444" stroke="#5e3b1d" stroke-width="4"/>`;
  return svg(w, h, g, grain("wb", 0.3, 0.6));
}

export function parchment() {
  return svg(512, 512, `<rect width="512" height="512" fill="#f3e6c4"/><rect width="512" height="512" filter="url(#pp)" fill="#fff"/>`, grain("pp", 0.16, 0.55));
}

export function wood() {
  let g = `<rect width="512" height="256" fill="#8f5c32"/>`;
  const r = rand(4);
  for (let i = 0; i < 26; i++) {
    const y = r() * 256;
    g += `<path d="M0,${y.toFixed(0)} Q128,${(y + (r() - 0.5) * 18).toFixed(0)} 256,${y.toFixed(0)} T512,${y.toFixed(0)}" stroke="${r() > 0.5 ? "#7a4d28" : "#a06a3a"}" stroke-width="${(1 + r() * 3).toFixed(1)}" fill="none" opacity="0.8"/>`;
  }
  return svg(512, 256, g + `<rect width="512" height="256" filter="url(#wg)" fill="#fff"/>`, grain("wg", 0.25, 0.5));
}
