import type { Photo, Settings, Shape } from "./types";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Plan {
  width: number;
  height: number;
  /** Outer cell of each photo, border included, in photo order. */
  cells: Rect[];
}

const ratio = (p: Photo) => p.width / p.height;

function median(values: number[]) {
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export function shapeRatio(shape: Shape, photos: Photo[]) {
  if (shape === "square") return 1;
  if (shape === "landscape") return 4 / 3;
  if (shape === "portrait") return 3 / 4;
  return photos.length ? median(photos.map(ratio)) : 4 / 3;
}

export function gridColumns(settings: Settings, count: number) {
  if (settings.columns !== "auto") return Math.min(settings.columns, Math.max(1, count));
  return Math.max(1, Math.ceil(Math.sqrt(count)));
}

/**
 * Lays the photos out so that the longer side of the merged image equals `settings.size`.
 * Every layout is linear in its free length t (row height, column width or tile width) plus fixed
 * spacing, margin and borders, so t is solved directly from the target size.
 */
export function plan(photos: Photo[], settings: Settings): Plan {
  const n = photos.length;
  const { spacing: g, margin: m, border: b, size: L } = settings;
  if (!n) return { width: 0, height: 0, cells: [] };

  if (settings.layout === "horizontal") {
    const sum = photos.reduce((s, p) => s + ratio(p), 0);
    const fixedW = 2 * m + n * 2 * b + g * (n - 1);
    const fixedH = 2 * m + 2 * b;
    const h = Math.max(1, Math.min((L - fixedW) / sum, L - fixedH));
    let x = m;
    const cells = photos.map((p) => {
      const cell = { x, y: m, w: ratio(p) * h + 2 * b, h: h + 2 * b };
      x += cell.w + g;
      return cell;
    });
    return { width: Math.round(fixedW + sum * h), height: Math.round(fixedH + h), cells };
  }

  if (settings.layout === "vertical") {
    const sum = photos.reduce((s, p) => s + 1 / ratio(p), 0);
    const fixedH = 2 * m + n * 2 * b + g * (n - 1);
    const fixedW = 2 * m + 2 * b;
    const w = Math.max(1, Math.min((L - fixedH) / sum, L - fixedW));
    let y = m;
    const cells = photos.map((p) => {
      const cell = { x: m, y, w: w + 2 * b, h: w / ratio(p) + 2 * b };
      y += cell.h + g;
      return cell;
    });
    return { width: Math.round(fixedW + w), height: Math.round(fixedH + sum * w), cells };
  }

  if (settings.layout === "grid") {
    const cols = gridColumns(settings, n);
    const rows = Math.ceil(n / cols);
    const r = shapeRatio(settings.shape, photos);
    const fixedW = 2 * m + cols * 2 * b + g * (cols - 1);
    const fixedH = 2 * m + rows * 2 * b + g * (rows - 1);
    const w = Math.max(1, Math.min((L - fixedW) / cols, ((L - fixedH) / rows) * r));
    const cw = w + 2 * b;
    const ch = w / r + 2 * b;
    const width = fixedW + cols * w;
    const cells = photos.map((_, i) => {
      const row = Math.floor(i / cols);
      const inRow = row === rows - 1 ? n - row * cols : cols;
      const offset = (width - 2 * m - (inRow * cw + (inRow - 1) * g)) / 2;
      return { x: m + offset + (i % cols) * (cw + g), y: m + row * (ch + g), w: cw, h: ch };
    });
    return { width: Math.round(width), height: Math.round(fixedH + (rows * w) / r), cells };
  }

  // Collage: the first photo is the feature on the left, the others fill one or two columns beside it.
  const r = settings.shape === "original" ? 3 / 2 : shapeRatio(settings.shape, photos);
  const width = r >= 1 ? L : Math.round(L * r);
  const height = r >= 1 ? Math.round(L / r) : L;
  const innerW = width - 2 * m;
  const innerH = height - 2 * m;
  if (n === 1) return { width, height, cells: [{ x: m, y: m, w: innerW, h: innerH }] };
  const rest = n - 1;
  const restCols = rest <= 3 ? 1 : 2;
  const restRows = Math.ceil(rest / restCols);
  const featureShare = n === 2 ? 0.5 : restCols === 1 ? 0.6 : 0.5;
  const featureW = (innerW - g) * featureShare;
  const cells: Rect[] = [{ x: m, y: m, w: featureW, h: innerH }];
  const colW = (innerW - g - featureW - g * (restCols - 1)) / restCols;
  for (let c = 0; c < restCols; c++) {
    const items = Math.min(restRows, rest - c * restRows);
    const rowH = (innerH - g * (items - 1)) / items;
    for (let k = 0; k < items; k++) cells.push({ x: m + featureW + g + c * (colW + g), y: m + k * (rowH + g), w: colW, h: rowH });
  }
  return { width, height, cells };
}
