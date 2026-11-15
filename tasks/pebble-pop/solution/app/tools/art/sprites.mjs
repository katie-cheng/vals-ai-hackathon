import { blob, grain, svg } from "./common.mjs";

const S = 128;
export const PEBBLES = {
  orange: { light: "#f6b35a", base: "#e2812a", dark: "#a8501a", mark: "#fff1d6", shape: [50, 44, 1] },
  blue: { light: "#8cc3ea", base: "#3d82c4", dark: "#22507f", mark: "#e8f5ff", shape: [48, 46, 2] },
  purple: { light: "#b994e3", base: "#8558c0", dark: "#4f2d82", mark: "#f6ecff", shape: [47, 47, 3] },
  green: { light: "#a8d07a", base: "#5f9a3a", dark: "#33602a", mark: "#f1f9e2", shape: [51, 43, 4] },
  red: { light: "#f08a7a", base: "#c8413a", dark: "#7f1f22", mark: "#fff0ea", shape: [48, 45, 5] },
  yellow: { light: "#fbe07a", base: "#e7b525", dark: "#a07314", mark: "#fffbe8", shape: [49, 47, 6] },
  pink: { light: "#f8b6d2", base: "#e07aa5", dark: "#9c3f6c", mark: "#fff2f8", shape: [46, 46, 7] },
};

const leaf = (c, rot = -35, s = 1) =>
  `<g transform="translate(64 66) rotate(${rot}) scale(${s})"><path d="M0,-30 C20,-20 22,10 0,30 C-22,10 -20,-20 0,-30Z" fill="${c}"/><path d="M0,-26 L0,28 M0,-8 L11,-16 M0,4 L13,-4 M0,14 L10,8 M0,-8 L-11,-16 M0,4 L-13,-4 M0,14 L-10,8" stroke="rgba(0,0,0,0.22)" stroke-width="2.4" fill="none" stroke-linecap="round"/></g>`;

const maple = (c) =>
  `<g transform="translate(64 64)"><path d="M0,-32 L7,-16 L20,-22 L16,-6 L30,-4 L19,6 L24,16 L9,13 L3,26 L0,32 L-3,26 L-9,13 L-24,16 L-19,6 L-30,-4 L-16,-6 L-20,-22 L-7,-16Z" fill="${c}" stroke="${c}" stroke-width="3" stroke-linejoin="round"/><path d="M0,30 L0,-22 M0,2 L16,-10 M0,2 L-16,-10 M0,12 L14,10 M0,12 L-14,10" stroke="rgba(120,50,10,0.35)" stroke-width="2.2" stroke-linecap="round" fill="none"/></g>`;

const swirl = (c) => {
  let d = "";
  for (let i = 0; i <= 64; i++) {
    const a = i * 0.29, r = 3 + i * 0.44;
    d += `${i ? "L" : "M"}${(64 + Math.cos(a) * r).toFixed(1)},${(64 + Math.sin(a) * r).toFixed(1)}`;
  }
  return `<path d="${d}" stroke="${c}" stroke-width="7" stroke-linecap="round" fill="none"/><circle cx="64" cy="64" r="4" fill="${c}"/>`;
};

const petals = (c, n, len, wid, center, rot = 0, notch = false) => {
  let g = `<g transform="translate(64 64) rotate(${rot})">`;
  for (let i = 0; i < n; i++) {
    const p = notch
      ? `M0,0 C${wid},-${len * 0.4} ${wid * 0.9},-${len} ${wid * 0.25},-${len} L0,-${len * 0.82} L-${wid * 0.25},-${len} C-${wid * 0.9},-${len} -${wid},-${len * 0.4} 0,0Z`
      : `M0,0 C${wid},-${len * 0.35} ${wid * 0.8},-${len} 0,-${len} C-${wid * 0.8},-${len} -${wid},-${len * 0.35} 0,0Z`;
    g += `<path d="${p}" fill="${c}" transform="rotate(${(360 / n) * i})"/>`;
  }
  return g + `<circle r="${len * 0.3}" fill="${center}"/><circle r="${len * 0.3}" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="2"/></g>`;
};

const sun = (c, core) => {
  let rays = "";
  for (let i = 0; i < 12; i++) rays += `<path d="M-4,-20 L0,-33 L4,-20Z" fill="${c}" transform="rotate(${i * 30})"/>`;
  return `<g transform="translate(64 64)">${rays}<circle r="17" fill="${c}"/><circle r="11" fill="${core}"/><path d="M-6,-3 Q0,4 6,-3" stroke="${c}" stroke-width="2.4" fill="none" stroke-linecap="round"/></g>`;
};

const EMBLEMS = {
  orange: (p) => maple(p.mark),
  blue: (p) => swirl(p.mark),
  purple: (p) => petals(p.mark, 5, 30, 17, "#f2c94c", -8),
  green: (p) => leaf(p.mark, -38, 1.08),
  red: (p) => petals(p.mark, 5, 30, 20, "#c8413a", 0, true) + `<g transform="translate(64 64)">${[0, 72, 144, 216, 288].map((r) => `<line x1="0" y1="0" x2="0" y2="-14" stroke="#f6b35a" stroke-width="2.4" transform="rotate(${r + 36})" stroke-linecap="round"/>`).join("")}</g>`,
  yellow: (p) => sun(p.mark, "#f6b35a"),
  pink: (p) => petals(p.mark, 11, 31, 8, "#f2c94c", 4),
};

export function pebble(name) {
  const p = PEBBLES[name];
  const [rx, ry, seed] = p.shape;
  const body = blob(64, 64, rx, ry, 0.12, seed * 17);
  const id = name;
  const defs = `<radialGradient id="g-${id}" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="${p.light}"/><stop offset="0.55" stop-color="${p.base}"/><stop offset="1" stop-color="${p.dark}"/></radialGradient>
  <clipPath id="c-${id}"><path d="${body}"/></clipPath>${grain(`n-${id}`, 0.28, 1.1)}`;
  return svg(
    S,
    S,
    `<path d="${blob(66, 70, rx, ry, 0.12, seed * 17)}" fill="rgba(30,25,10,0.28)"/>
     <path d="${body}" fill="url(#g-${id})"/>
     <rect width="128" height="128" filter="url(#n-${id})" clip-path="url(#c-${id})" fill="#fff"/>
     <g clip-path="url(#c-${id})" opacity="0.95">${EMBLEMS[name](p)}</g>
     <path d="${body}" fill="none" stroke="${p.dark}" stroke-width="3" opacity="0.7"/>
     <ellipse cx="44" cy="36" rx="16" ry="9" fill="#fff" opacity="0.38" transform="rotate(-28 44 36)"/>
     <ellipse cx="38" cy="33" rx="5" ry="3" fill="#fff" opacity="0.7" transform="rotate(-28 38 33)"/>`,
    defs,
  );
}

export function frozen() {
  const shape = "M18,24 Q16,14 26,14 L102,12 Q114,12 114,24 L116,100 Q116,114 102,114 L26,116 Q12,116 12,102Z";
  return svg(
    S,
    S,
    `<path d="${shape}" fill="rgba(196,233,250,0.55)" stroke="#e9f8ff" stroke-width="4"/>
     <path d="${shape}" fill="none" stroke="#7fbfe0" stroke-width="2" opacity="0.8"/>
     <path d="M30,20 L52,48 L44,70 M52,48 L80,40 L98,22 M80,40 L88,74 L108,86 M44,70 L22,92 M88,74 L64,100 L62,114" stroke="#ffffff" stroke-width="2.2" fill="none" opacity="0.85" stroke-linecap="round"/>
     <path d="M24,30 Q26,22 36,22 L60,22" stroke="#fff" stroke-width="6" fill="none" opacity="0.7" stroke-linecap="round"/>
     <path d="M100,96 Q100,104 92,106" stroke="#fff" stroke-width="4" fill="none" opacity="0.5" stroke-linecap="round"/>`,
  );
}

export function stone(cracked) {
  const body = blob(64, 70, 52, 44, 0.2, 333, 11);
  const defs = `<radialGradient id="st" cx="40%" cy="30%" r="80%"><stop offset="0" stop-color="#b9b3a3"/><stop offset="0.6" stop-color="#857f72"/><stop offset="1" stop-color="#4f4a42"/></radialGradient><clipPath id="sc"><path d="${body}"/></clipPath>${grain("sn", 0.45, 1.4)}`;
  const crack = cracked
    ? `<path d="M64,28 L58,50 L70,62 L60,82 L66,104 M70,62 L90,70 L100,64 M58,50 L40,46" stroke="#2f2b26" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
    : "";
  return svg(
    S,
    S,
    `<path d="${blob(66, 76, 52, 42, 0.2, 333, 11)}" fill="rgba(20,20,10,0.3)"/>
     <path d="${body}" fill="url(#st)"/>
     <rect width="128" height="128" filter="url(#sn)" clip-path="url(#sc)" fill="#fff"/>
     <g clip-path="url(#sc)"><path d="M10,52 Q30,30 50,38 Q64,22 84,30 Q100,26 118,44 L118,10 L10,10Z" fill="#6f9a43"/><path d="M10,52 Q30,30 50,38 Q64,22 84,30 Q100,26 118,44" stroke="#4d7330" stroke-width="3" fill="none"/>
     ${[22, 36, 52, 70, 88, 104].map((x, i) => `<circle cx="${x}" cy="${36 - (i % 2) * 6}" r="${4 + (i % 3)}" fill="#8fbf5a"/>`).join("")}</g>
     <path d="${body}" fill="none" stroke="#3f3a33" stroke-width="3"/>${crack}
     <ellipse cx="44" cy="58" rx="12" ry="6" fill="#fff" opacity="0.18"/>`,
    defs,
  );
}

export function flowerObstacle() {
  const bush = blob(64, 74, 54, 40, 0.3, 91, 13);
  const flower = (x, y, s, c) =>
    `<g transform="translate(${x} ${y}) scale(${s})">${[0, 72, 144, 216, 288].map((r) => `<ellipse cx="0" cy="-9" rx="6" ry="9" fill="${c}" transform="rotate(${r})"/>`).join("")}<circle r="5" fill="#f2b631"/></g>`;
  return svg(
    S,
    S,
    `<path d="${blob(66, 80, 54, 38, 0.3, 91, 13)}" fill="rgba(20,30,10,0.3)"/>
     <path d="${bush}" fill="#3f7a35"/>
     <path d="${blob(56, 64, 40, 28, 0.35, 12, 11)}" fill="#549243"/>
     <path d="${blob(76, 70, 34, 24, 0.35, 44, 11)}" fill="#4b8a3c"/>
     ${[[30, 70, -30], [96, 66, 30], [60, 98, 0], [86, 96, 40]].map(([x, y, r]) => `<path d="M0,-12 C8,-6 8,6 0,12 C-8,6 -8,-6 0,-12Z" fill="#6fae4f" transform="translate(${x} ${y}) rotate(${r})"/>`).join("")}
     ${flower(42, 52, 1.2, "#fff8ec")}${flower(80, 46, 1.05, "#f7c6d9")}${flower(64, 80, 1.15, "#fff8ec")}${flower(96, 82, 0.85, "#f7c6d9")}${flower(30, 88, 0.8, "#fff8ec")}
     <path d="${bush}" fill="none" stroke="#2c5a28" stroke-width="3"/>`,
  );
}

export function lock() {
  return svg(
    S,
    S,
    `<rect x="8" y="10" width="112" height="108" rx="12" fill="#6b4426"/>
     ${[22, 50, 78, 106].map((y) => `<rect x="12" y="${y - 10}" width="104" height="24" rx="5" fill="#946437"/><path d="M18,${y - 2} Q50,${y - 6} 110,${y}" stroke="#7a5030" stroke-width="2" fill="none"/>`).join("")}
     <circle cx="22" cy="22" r="4" fill="#3a2a1c"/><circle cx="106" cy="22" r="4" fill="#3a2a1c"/><circle cx="22" cy="106" r="4" fill="#3a2a1c"/><circle cx="106" cy="106" r="4" fill="#3a2a1c"/>
     <path d="M48,60 V48 a16,16 0 0 1 32,0 V60" stroke="#c9c2b0" stroke-width="9" fill="none"/>
     <path d="M48,60 V48 a16,16 0 0 1 32,0 V60" stroke="#8d877a" stroke-width="3" fill="none"/>
     <rect x="38" y="58" width="52" height="42" rx="7" fill="#d6a23a" stroke="#8a5f14" stroke-width="3"/>
     <circle cx="64" cy="75" r="6" fill="#5a3d0d"/><rect x="61" y="77" width="6" height="13" rx="2" fill="#5a3d0d"/>
     <rect x="8" y="10" width="112" height="108" rx="12" fill="none" stroke="#3f2816" stroke-width="4"/>`,
  );
}

export function crystal() {
  return svg(
    S,
    S,
    `<ellipse cx="64" cy="114" rx="34" ry="7" fill="rgba(0,0,0,0.22)"/>
     <path d="M64,10 L98,40 L86,108 L42,108 L30,40Z" fill="#3fb3b0"/>
     <path d="M64,10 L98,40 L64,52Z" fill="#8ee3dc"/><path d="M64,10 L30,40 L64,52Z" fill="#62cdc6"/>
     <path d="M30,40 L64,52 L42,108Z" fill="#2c9693"/><path d="M98,40 L64,52 L86,108Z" fill="#247c84"/>
     <path d="M64,52 L42,108 L86,108Z" fill="#35a6a6"/>
     <path d="M64,10 L98,40 L86,108 L42,108 L30,40Z" fill="none" stroke="#155a5e" stroke-width="3" stroke-linejoin="round"/>
     <path d="M50,28 L58,22" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.8"/>`,
  );
}

const starPath = (cx, cy, R, r) => {
  let d = "";
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r : R;
    d += `${i ? "L" : "M"}${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`;
  }
  return d + "Z";
};

export function star(empty) {
  const d = starPath(64, 68, 56, 26);
  if (empty)
    return svg(S, S, `<path d="${d}" fill="#5b4632" opacity="0.55" stroke="#3b2c1f" stroke-width="5" stroke-linejoin="round"/><path d="${starPath(64, 68, 40, 18)}" fill="#7a6248" opacity="0.6"/>`);
  return svg(
    S,
    S,
    `<path d="${starPath(66, 72, 56, 26)}" fill="rgba(60,30,0,0.3)"/>
     <path d="${d}" fill="url(#gs)" stroke="#9a5f0c" stroke-width="5" stroke-linejoin="round"/>
     <path d="${starPath(64, 66, 36, 16)}" fill="#ffe58a" opacity="0.7"/>
     <path d="M44,40 L54,34" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.85"/>`,
    `<linearGradient id="gs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd54a"/><stop offset="1" stop-color="#e59a17"/></linearGradient>`,
  );
}

export function hammer() {
  return svg(
    S,
    S,
    `<g transform="rotate(-38 64 64)">
     <rect x="58" y="44" width="12" height="74" rx="5" fill="#b07a45" stroke="#5e3b1d" stroke-width="3"/>
     <rect x="58" y="96" width="12" height="16" rx="3" fill="#7d8f45" stroke="#45501f" stroke-width="2"/>
     <rect x="24" y="16" width="80" height="36" rx="9" fill="#8f5c32" stroke="#4a2c14" stroke-width="4"/>
     <rect x="24" y="16" width="14" height="36" rx="5" fill="#6e4422"/><rect x="90" y="16" width="14" height="36" rx="5" fill="#6e4422"/>
     <path d="M40,24 H86" stroke="#c48a54" stroke-width="4" stroke-linecap="round"/>
     <path d="M30,26 h4 M30,34 h4 M30,42 h4 M94,26 h4 M94,34 h4 M94,42 h4" stroke="#4a2c14" stroke-width="2"/></g>`,
  );
}

export function swap() {
  return svg(
    S,
    S,
    `<path d="M26,58 A38,38 0 0 1 96,38" stroke="#3f7a35" stroke-width="12" fill="none" stroke-linecap="round"/>
     <path d="M84,20 L106,40 L80,50Z" fill="#3f7a35" stroke="#2c5a28" stroke-width="3" stroke-linejoin="round"/>
     <path d="M102,70 A38,38 0 0 1 32,90" stroke="#2e78b0" stroke-width="12" fill="none" stroke-linecap="round"/>
     <path d="M44,108 L22,88 L48,78Z" fill="#2e78b0" stroke="#22507f" stroke-width="3" stroke-linejoin="round"/>
     <circle cx="44" cy="56" r="12" fill="#e2812a" stroke="#a8501a" stroke-width="3"/><circle cx="84" cy="72" r="12" fill="#8558c0" stroke="#4f2d82" stroke-width="3"/>`,
  );
}

export function bomb() {
  return svg(
    S,
    S,
    `<ellipse cx="62" cy="114" rx="36" ry="7" fill="rgba(0,0,0,0.25)"/>
     <path d="M74,28 Q88,10 104,16" stroke="#8a6a3a" stroke-width="5" fill="none" stroke-linecap="round"/>
     <g transform="translate(106 14)">${[0, 60, 120, 180, 240, 300].map((r) => `<path d="M0,0 L0,-11" stroke="#f6b35a" stroke-width="4" stroke-linecap="round" transform="rotate(${r})"/>`).join("")}<circle r="5" fill="#fff1c1"/></g>
     <rect x="62" y="22" width="20" height="16" rx="4" fill="#5a4a3a" transform="rotate(20 72 30)"/>
     <circle cx="60" cy="72" r="40" fill="#3a3f3a" stroke="#1f231f" stroke-width="4"/>
     <path d="M30,70 Q60,52 90,70" stroke="#55603f" stroke-width="5" fill="none"/>
     <path d="M34,86 Q60,100 86,86" stroke="#55603f" stroke-width="4" fill="none"/>
     <ellipse cx="44" cy="54" rx="11" ry="7" fill="#fff" opacity="0.3" transform="rotate(-30 44 54)"/>
     <path d="M50,40 C56,30 70,30 74,38" stroke="#6f9a43" stroke-width="5" fill="none"/>`,
  );
}

export function acorn() {
  return svg(
    S,
    S,
    `<path d="M30,52 Q30,108 64,118 Q98,108 98,52Z" fill="#c98a3c" stroke="#7a4d1c" stroke-width="4"/>
     <path d="M40,60 Q44,96 64,108" stroke="#e8b46c" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8"/>
     <path d="M20,54 Q22,26 64,24 Q106,26 108,54 Q64,66 20,54Z" fill="#7a5530" stroke="#4a2f14" stroke-width="4"/>
     <path d="M30,46 L40,36 M46,48 L56,34 M64,48 L72,34 M80,48 L88,36 M92,50 L100,42" stroke="#4a2f14" stroke-width="3" stroke-linecap="round"/>
     <path d="M64,24 Q62,10 72,6" stroke="#4a2f14" stroke-width="6" fill="none" stroke-linecap="round"/>`,
  );
}

export function medal() {
  return svg(
    S,
    S,
    `<path d="M40,8 L58,58 L44,64 L24,12Z" fill="#3f7a35"/><path d="M88,8 L70,58 L84,64 L104,12Z" fill="#2e78b0"/>
     <circle cx="64" cy="82" r="38" fill="#e7b525" stroke="#9a6a10" stroke-width="5"/>
     <circle cx="64" cy="82" r="27" fill="none" stroke="#fbe07a" stroke-width="3"/>
     <path d="${starPath(64, 83, 18, 8)}" fill="#fff4c4"/>`,
  );
}

export function sparkle() {
  return svg(64, 64, `<path d="M32,2 C35,24 40,29 62,32 C40,35 35,40 32,62 C29,40 24,35 2,32 C24,29 29,24 32,2Z" fill="#fff6d6"/><circle cx="32" cy="32" r="5" fill="#fff"/>`);
}

export function leafParticle() {
  return svg(48, 48, `<path d="M24,4 C38,12 40,32 24,44 C8,32 10,12 24,4Z" fill="#8fbf5a"/><path d="M24,8 L24,42" stroke="#4d7330" stroke-width="2"/>`);
}

export function petalParticle() {
  return svg(40, 40, `<path d="M20,4 C32,10 32,28 20,36 C8,28 8,10 20,4Z" fill="#f7c6d9"/><path d="M20,10 L20,30" stroke="#e07aa5" stroke-width="1.5" opacity="0.6"/>`);
}

export function ring() {
  return svg(128, 128, `<circle cx="64" cy="64" r="54" fill="none" stroke="#fff6d6" stroke-width="8" opacity="0.9"/>`);
}

export function snowParticle() {
  return svg(40, 40, `<g transform="translate(20 20)" stroke="#f2fbff" stroke-width="3" stroke-linecap="round">${[0, 60, 120].map((r) => `<path d="M0,-15 V15" transform="rotate(${r})"/>`).join("")}</g>`);
}
