import { memo, useLayoutEffect, useRef } from "react";
import type { Spin } from "../server";

// One path for the glass, one for the label and one highlight: a small, static SVG that only ever gets rotated.
function BottleArt() {
  return (
    <svg className="bottle-art" viewBox="0 0 80 240" aria-hidden="true">
      <path className="bottle-glass" d="M33 6h14v4h-1v40c0 9 22 26 22 52v118c0 8-6 14-14 14H24c-8 0-14-6-14-14V102c0-26 22-43 22-52V10h-1z" />
      <rect className="bottle-label" x="10" y="132" width="60" height="52" />
      <path className="bottle-shine" d="M19 108c0-12 6-22 12-29v120h-12z" />
    </svg>
  );
}

const keyframes = (from: number, to: number): Keyframe[] => [
  // Speeds up over the first half turn, slows down over the remaining turns, overshoots slightly, then settles.
  { transform: `rotate(${from}deg)`, easing: "cubic-bezier(0.6, 0, 0.9, 0.5)" },
  { transform: `rotate(${from + 180}deg)`, offset: 0.14, easing: "cubic-bezier(0.15, 0.6, 0.3, 1)" },
  { transform: `rotate(${to + 7}deg)`, offset: 0.86, easing: "ease-in-out" },
  { transform: `rotate(${to - 2.5}deg)`, offset: 0.94, easing: "ease-in-out" },
  { transform: `rotate(${to}deg)` },
];

/** The bottle, pointing at 0deg (player 1, above) or 180deg (player 2, below). A spin started on either phone plays from the shared start time. */
function Bottle({ spin }: { spin: Spin | null }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rest = `rotate(${spin ? spin.to : 0}deg)`;
    el.style.transform = rest;
    if (!spin) return;
    const elapsed = Date.now() - spin.startedAt;
    if (elapsed >= spin.duration) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animation = reduced
      ? el.animate([{ transform: `rotate(${spin.to - 90}deg)` }, { transform: rest }], { duration: Math.min(600, spin.duration - elapsed), easing: "ease-out" })
      : el.animate(keyframes(spin.from, spin.to), { duration: spin.duration });
    if (!reduced) animation.currentTime = Math.max(0, elapsed);
    return () => animation.cancel();
  }, [spin?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="bottle-table">
      <div className="bottle" ref={ref} data-angle={spin ? ((spin.to % 360) + 360) % 360 : 0} data-testid="bottle">
        <BottleArt />
      </div>
    </div>
  );
}

export default memo(Bottle, (a, b) => a.spin?.id === b.spin?.id);
