import type { LayoutKind } from "../editor/types";

const RECTS: Record<LayoutKind, [number, number, number, number][]> = {
  horizontal: [[2, 6, 6, 12], [9, 6, 6, 12], [16, 6, 6, 12]],
  vertical: [[5, 2, 14, 6], [5, 9, 14, 6], [5, 16, 14, 6]],
  grid: [[3, 3, 8.5, 8.5], [12.5, 3, 8.5, 8.5], [3, 12.5, 8.5, 8.5], [12.5, 12.5, 8.5, 8.5]],
  collage: [[2, 4, 11, 16], [14, 4, 8, 7.5], [14, 12.5, 8, 7.5]],
};

export function LayoutIcon({ kind }: { kind: LayoutKind }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
      {RECTS[kind].map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} rx="1.5" fill="currentColor" opacity={i === 0 ? 1 : 0.6} />
      ))}
    </svg>
  );
}
