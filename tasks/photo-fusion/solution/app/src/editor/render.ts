import { plan, type Plan, type Rect } from "./layout";
import { GRADIENTS, type Photo, type Settings } from "./types";

function roundedRect(ctx: CanvasRenderingContext2D, r: Rect, radius: number) {
  const rad = Math.max(0, Math.min(radius, r.w / 2, r.h / 2));
  ctx.beginPath();
  if (rad > 0) ctx.roundRect(r.x, r.y, r.w, r.h, rad);
  else ctx.rect(r.x, r.y, r.w, r.h);
}

function paintBackground(ctx: CanvasRenderingContext2D, settings: Settings, width: number, height: number) {
  const bg = settings.background;
  if (bg.kind === "transparent") {
    if (settings.format === "jpg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
    }
    return;
  }
  if (bg.kind === "color") {
    ctx.fillStyle = bg.color;
    ctx.fillRect(0, 0, width, height);
    return;
  }
  const { stops, angle } = GRADIENTS[bg.id];
  const a = (angle * Math.PI) / 180;
  const half = (Math.abs(width * Math.sin(a)) + Math.abs(height * Math.cos(a))) / 2;
  const cx = width / 2;
  const cy = height / 2;
  const dx = Math.sin(a) * half;
  const dy = -Math.cos(a) * half;
  const grad = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy);
  grad.addColorStop(0, stops[0]);
  grad.addColorStop(1, stops[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
}

function drawPhoto(ctx: CanvasRenderingContext2D, photo: Photo, box: Rect, fit: Settings["fit"]) {
  const pr = photo.width / photo.height;
  const br = box.w / box.h;
  if (fit === "fill") {
    let sw = photo.width;
    let sh = photo.height;
    if (pr > br) sw = photo.height * br;
    else sh = photo.width / br;
    ctx.drawImage(photo.source, (photo.width - sw) / 2, (photo.height - sh) / 2, sw, sh, box.x, box.y, box.w, box.h);
  } else {
    let w = box.w;
    let h = box.h;
    if (pr > br) h = box.w / pr;
    else w = box.h * pr;
    ctx.drawImage(photo.source, box.x + (box.w - w) / 2, box.y + (box.h - h) / 2, w, h);
  }
}

/** Draws the merged image into `canvas` at `scale` (1 for export, smaller for the live preview). */
export function render(canvas: HTMLCanvasElement, photos: Photo[], settings: Settings, scale = 1, layout: Plan = plan(photos, settings)) {
  canvas.width = Math.max(1, Math.round(layout.width * scale));
  canvas.height = Math.max(1, Math.round(layout.height * scale));
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.clearRect(0, 0, layout.width, layout.height);
  ctx.imageSmoothingQuality = "high";
  paintBackground(ctx, settings, layout.width, layout.height);
  const b = settings.border;
  // Horizontal and vertical cells already match each photo's shape, so only grid and collage tiles can crop.
  const fit = settings.layout === "horizontal" || settings.layout === "vertical" ? "fill" : settings.fit;
  photos.forEach((photo, i) => {
    const cell = layout.cells[i];
    if (!cell) return;
    if (b > 0) {
      ctx.fillStyle = settings.borderColor;
      roundedRect(ctx, cell, settings.radius);
      ctx.fill();
    }
    const inner = { x: cell.x + b, y: cell.y + b, w: Math.max(1, cell.w - 2 * b), h: Math.max(1, cell.h - 2 * b) };
    ctx.save();
    roundedRect(ctx, inner, Math.max(0, settings.radius - b));
    ctx.clip();
    drawPhoto(ctx, photo, inner, fit);
    ctx.restore();
  });
  return layout;
}

export function exportBlob(photos: Photo[], settings: Settings): Promise<Blob> {
  const canvas = document.createElement("canvas");
  render(canvas, photos, settings, 1);
  const type = settings.format === "png" ? "image/png" : "image/jpeg";
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("The browser could not encode the image."))), type, settings.quality),
  );
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
