import type { Photo } from "./types";

let counter = 0;

export const isImage = (file: File) => file.type.startsWith("image/") || /\.(jpe?g|png|webp|gif|bmp|avif|heic)$/i.test(file.name);

async function decode(blob: Blob): Promise<{ source: CanvasImageSource; width: number; height: number }> {
  try {
    const bitmap = await createImageBitmap(blob, { imageOrientation: "from-image" });
    return { source: bitmap, width: bitmap.width, height: bitmap.height };
  } catch {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.src = url;
    await img.decode();
    return { source: img, width: img.naturalWidth, height: img.naturalHeight };
  }
}

/** Reads files into photos; files the browser cannot decode are returned by name in `failed`. */
export async function loadPhotos(files: File[]): Promise<{ photos: Photo[]; failed: string[] }> {
  const photos: Photo[] = [];
  const failed: string[] = [];
  for (const file of files) {
    try {
      const { source, width, height } = await decode(file);
      photos.push({ id: `p${++counter}`, name: file.name, url: URL.createObjectURL(file), source, width, height });
    } catch {
      failed.push(file.name);
    }
  }
  return { photos, failed };
}

export async function loadSamples(): Promise<Photo[]> {
  const names = ["mountain", "coast", "forest", "flowers"];
  const files = await Promise.all(
    names.map(async (n) => {
      const res = await fetch(`${import.meta.env.BASE_URL}samples/${n}.jpg`);
      const blob = await res.blob();
      return new File([blob], `${n}.jpg`, { type: "image/jpeg" });
    }),
  );
  return (await loadPhotos(files)).photos;
}

export function releasePhoto(photo: Photo) {
  URL.revokeObjectURL(photo.url);
  if ("close" in photo.source && typeof photo.source.close === "function") photo.source.close();
}
