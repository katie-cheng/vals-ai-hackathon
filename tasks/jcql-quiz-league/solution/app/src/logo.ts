const LOGO_BOX = 256;
export const LOGO_MAX_BYTES = 8 * 1024 * 1024;

const initials = (name: string) =>
  name
    .replace(/^the\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => [...w][0].toUpperCase())
    .join("");

/** A plain initials tile, used for the sample teams and for teams added without a logo. */
export function monogram(name: string, colour = "#3f4a44") {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" fill="${colour}"/><text x="48" y="50" fill="#efe9dc" font-family="Georgia, serif" font-size="38" text-anchor="middle" dominant-baseline="central">${initials(name).replace(/[<&>]/g, "")}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/** Reads an uploaded image and scales it to fit a 256px box, so logos stay small enough for the browser's storage. */
export function readLogo(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) return reject(new Error("Choose an image file (PNG, JPG, SVG or WebP)."));
    if (file.size > LOGO_MAX_BYTES) return reject(new Error("That image is over 8 MB. Choose a smaller file."));
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth || LOGO_BOX;
      const h = img.naturalHeight || LOGO_BOX;
      const scale = Math.min(1, LOGO_BOX / Math.max(w, h));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(w * scale));
      canvas.height = Math.max(1, Math.round(h * scale));
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      const webp = canvas.toDataURL("image/webp", 0.9);
      resolve(webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/png"));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That file could not be read as an image."));
    };
    img.src = url;
  });
}
