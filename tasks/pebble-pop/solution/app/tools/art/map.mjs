import { readFileSync } from "node:fs";
import { grain, rand, smooth, svg } from "./common.mjs";
import { THEMES, bush, conifer, lantern, rock, roundTree } from "./scenery.mjs";

const layout = JSON.parse(readFileSync(new URL("../../src/ui/mapLayout.json", import.meta.url)));
const ORDER = ["mossy", "frost", "blossom", "autumn"];

function openPath(pts) {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2;
    d += `C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
  }
  return d;
}

/** Tall illustrated world map: four chapter regions joined by a winding trail, a river and bridges. */
export function worldMap() {
  const { width: w, height: h, path } = layout;
  const band = h / 4;
  const r = rand(21);
  let g = "";
  ORDER.forEach((key, i) => {
    const t = THEMES[key];
    const y0 = h - band * (i + 1);
    g += `<rect y="${y0 - 2}" width="${w}" height="${band + 4}" fill="${t.ground}"/>`;
    for (let k = 0; k < 7; k++) g += `<path d="M${r() * w},${y0 + r() * band} q60,-30 140,0" stroke="${t.leaf[1]}" stroke-width="10" fill="none" opacity="0.35" stroke-linecap="round"/>`;
  });
  for (let i = 1; i < 4; i++) {
    const y = h - band * i;
    const edge = smooth([[0, y - 40], [w * 0.3, y + 30], [w * 0.6, y - 30], [w, y + 20], [w, y + 80], [0, y + 60]]);
    g += `<path d="${edge}" fill="${THEMES[ORDER[i]].ground}" opacity="0.65"/>`;
  }
  const river = openPath([[-40, 120], [260, 380], [140, 700], [620, 960], [900, 1180], [860, 1640], [400, 1900], [660, 2160], [1120, 2300]]);
  g += `<path d="${river}" stroke="#2f6f93" stroke-width="96" fill="none" stroke-linecap="round"/><path d="${river}" stroke="#6fb3cf" stroke-width="72" fill="none" stroke-linecap="round"/><path d="${river}" stroke="#d8f0fa" stroke-width="6" stroke-dasharray="40 70" fill="none" opacity="0.8"/>`;
  g += `<path d="M150,2300 q30,-120 10,-220" stroke="#d8f0fa" stroke-width="40" opacity="0.7" fill="none"/>`;
  const trail = openPath(path);
  g += `<path d="${trail}" stroke="#7a5a30" stroke-width="58" fill="none" stroke-linecap="round" opacity="0.55"/><path d="${trail}" stroke="#e9d3a2" stroke-width="44" fill="none" stroke-linecap="round"/><path d="${trail}" stroke="#c7a86c" stroke-width="5" stroke-dasharray="18 26" fill="none"/>`;
  const bridges = [[548, 1702, -28], [520, 1012, 30], [282, 416, -40]];
  for (const [x, y, rot] of bridges) {
    g += `<g transform="translate(${x} ${y}) rotate(${rot})"><rect x="-90" y="-36" width="180" height="72" rx="8" fill="#8f5c32" stroke="#4a2c14" stroke-width="5"/>${[-60, -30, 0, 30, 60].map((px) => `<path d="M${px},-34 V34" stroke="#6e4422" stroke-width="4"/>`).join("")}<path d="M-96,-40 H96 M-96,40 H96" stroke="#5e3b1d" stroke-width="8" stroke-linecap="round"/></g>`;
  }
  const place = (key, i, fn) => {
    const y0 = h - band * (i + 1);
    for (let k = 0; k < 9; k++) {
      const side = k % 2 ? w * (0.82 + r() * 0.14) : w * (0.04 + r() * 0.14);
      const x = k < 6 ? side : w * (0.3 + r() * 0.4);
      const y = y0 + 120 + r() * (band - 140);
      g += fn(x, y, k);
    }
  };
  ORDER.forEach((key, i) => {
    const t = THEMES[key];
    place(key, i, (x, y, k) => (k % 3 === 2 ? bush(x, y, 0.8, t, 300 + i * 10 + k) : t.snow || k % 2 ? conifer(x, y, 0.55, t, 400 + k) : roundTree(x, y, 0.45, t, 500 + i * 9 + k)));
    const y0 = h - band * (i + 1);
    g += rock(w * 0.62, y0 + band * 0.75, 0.9, 600 + i) + lantern(w * (i % 2 ? 0.52 : 0.47), y0 + band * 0.42, 0.8);
  });
  g += `<rect width="${w}" height="${h}" filter="url(#mg)" fill="#fff"/>`;
  return svg(w, h, g, grain("mg", 0.12, 0.6));
}
