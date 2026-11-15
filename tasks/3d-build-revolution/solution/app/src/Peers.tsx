import { useEffect, useState } from "react";

const PEERS = [
  { name: "Ana, architect", path: [[0.18, 0.2], [0.62, 0.32], [0.7, 0.62], [0.3, 0.78], [0.18, 0.2]], period: 19000 },
  { name: "Tom, site lead", path: [[0.85, 0.82], [0.48, 0.66], [0.22, 0.52], [0.55, 0.14], [0.85, 0.82]], period: 23000 },
];

const lerpPath = (path: number[][], t: number) => {
  const seg = path.length - 1, f = t * seg, i = Math.min(seg - 1, Math.floor(f)), k = f - i;
  const e = k * k * (3 - 2 * k);
  return [path[i][0] + (path[i + 1][0] - path[i][0]) * e, path[i][1] + (path[i + 1][1] - path[i][1]) * e];
};

/** Simulated collaborators' cursors moving over the design, as in a shared review session. */
export function Peers({ on }: { on: boolean }) {
  const [now, setNow] = useState(() => performance.now());
  useEffect(() => {
    if (!on || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const tick = () => {
      setNow(performance.now());
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [on]);
  if (!on) return null;
  return (
    <div className="peers" aria-hidden="true">
      {PEERS.map((p, i) => {
        const [x, y] = lerpPath(p.path, ((now + i * 4000) % p.period) / p.period);
        return (
          <div key={p.name} className={`peer peer-${i}`} style={{ left: `${x * 100}%`, top: `${y * 100}%` }}>
            <svg viewBox="0 0 16 20" width="16" height="20"><path d="M1 1l13 8-6 1.5L5 18z" /></svg>
            <span>{p.name}</span>
          </div>
        );
      })}
    </div>
  );
}
