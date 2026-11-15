import { useId, useRef, useState, type PointerEvent as RPE, type KeyboardEvent } from "react";
import { type Config, FLOORS, clamp, roofRise, shade, wallHeight } from "./model";

type V3 = [number, number, number];
interface Face {
  key: string;
  pts: V3[];
  fill: string;
  /** Wall faces carry a local frame (origin, s axis, t axis) so patterns and openings can be drawn in metres. */
  frame?: { o: V3; s: V3; t: V3; local: [number, number][]; pattern?: string; openings?: boolean };
}

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (a: V3): V3 => {
  const l = Math.hypot(...a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const SUN = norm([0.55, 0.9, 0.7]);
const TERRACE = 0.25;

function buildFaces(c: Config): Face[] {
  const W = c.width, D = c.depth, b = TERRACE, e = b + wallHeight(c), rise = roofRise(c), o = 0.35;
  const faces: Face[] = [];
  const floor = FLOORS.find((f) => f.id === c.floor)!;
  // Terrace slab: the floor finish, carried out in front of the house.
  const tx0 = -0.8, tx1 = W + 0.8, tz0 = -0.8, tz1 = D + 2.6;
  const box = (key: string, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, fill: string, topPattern?: string) => {
    faces.push({ key: key + "-top", pts: [[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]], fill, frame: topPattern ? { o: [x0, y1, z1], s: [1, 0, 0], t: [0, 0, -1], local: [[0, 0], [x1 - x0, 0], [x1 - x0, z1 - z0], [0, z1 - z0]], pattern: topPattern } : undefined });
    faces.push({ key: key + "-front", pts: [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], fill });
    faces.push({ key: key + "-back", pts: [[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]], fill });
    faces.push({ key: key + "-left", pts: [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], fill });
    faces.push({ key: key + "-right", pts: [[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]], fill });
  };
  box("terrace", tx0, tx1, 0, b, tz0, tz1, floor.color, `floor-${c.floor}`);

  // Wall outlines in each wall's local (s, t) coordinates, t measured up from the terrace.
  const h = e - b;
  const side = (len: number, left: boolean): [number, number][] => {
    if (c.roof === "gable") return [[0, 0], [len, 0], [len, h], [len / 2, h + rise], [0, h]];
    if (c.roof === "mono") return left ? [[0, 0], [len, 0], [len, h], [0, h + rise]] : [[0, 0], [len, 0], [len, h + rise], [0, h]];
    return [[0, 0], [len, 0], [len, h], [0, h]];
  };
  const pattern = `wall-${c.wall}`;
  const wall = (key: string, o3: V3, s: V3, local: [number, number][], openings = false) => {
    const t: V3 = [0, 1, 0];
    const pts = local.map(([u, v]) => [o3[0] + s[0] * u, o3[1] + v, o3[2] + s[2] * u] as V3);
    faces.push({ key, pts, fill: c.paint, frame: { o: o3, s, t, local, pattern, openings } });
  };
  const backH = c.roof === "mono" ? h + rise : h;
  wall("front", [0, b, D], [1, 0, 0], [[0, 0], [W, 0], [W, h], [0, h]], true);
  wall("back", [W, b, 0], [-1, 0, 0], [[0, 0], [W, 0], [W, backH], [0, backH]]);
  wall("left", [0, b, 0], [0, 0, 1], side(D, true));
  wall("right", [W, b, D], [0, 0, -1], side(D, false));

  const rc = c.roofCovering;
  if (c.roof === "flat") box("roof", -o, W + o, e, e + rise, -o, D + o, rc);
  else if (c.roof === "gable") {
    const top = e + rise;
    faces.push({ key: "roof-front", pts: [[-o, e, D + o], [W + o, e, D + o], [W + o, top, D / 2], [-o, top, D / 2]], fill: rc });
    faces.push({ key: "roof-back", pts: [[W + o, e, -o], [-o, e, -o], [-o, top, D / 2], [W + o, top, D / 2]], fill: rc });
  } else if (c.roof === "hip") {
    const top = e + rise;
    if (W >= D) {
      const r = D / 2;
      faces.push({ key: "roof-front", pts: [[-o, e, D + o], [W + o, e, D + o], [W - r, top, D / 2], [r, top, D / 2]], fill: rc });
      faces.push({ key: "roof-back", pts: [[W + o, e, -o], [-o, e, -o], [r, top, D / 2], [W - r, top, D / 2]], fill: rc });
      faces.push({ key: "roof-left", pts: [[-o, e, -o], [-o, e, D + o], [r, top, D / 2]], fill: rc });
      faces.push({ key: "roof-right", pts: [[W + o, e, D + o], [W + o, e, -o], [W - r, top, D / 2]], fill: rc });
    } else {
      const r = W / 2;
      faces.push({ key: "roof-front", pts: [[-o, e, D + o], [W + o, e, D + o], [W / 2, top, D - r]], fill: rc });
      faces.push({ key: "roof-back", pts: [[W + o, e, -o], [-o, e, -o], [W / 2, top, r]], fill: rc });
      faces.push({ key: "roof-left", pts: [[-o, e, -o], [-o, e, D + o], [W / 2, top, D - r], [W / 2, top, r]], fill: rc });
      faces.push({ key: "roof-right", pts: [[W + o, e, D + o], [W + o, e, -o], [W / 2, top, r], [W / 2, top, D - r]], fill: rc });
    }
  } else {
    faces.push({ key: "roof-mono", pts: [[-o, e, D + o], [W + o, e, D + o], [W + o, e + rise, -o], [-o, e + rise, -o]], fill: rc });
  }
  return faces;
}

function Patterns({ id, c }: { id: string; c: Config }) {
  const ink = shade(c.paint, -0.22);
  const floor = FLOORS.find((f) => f.id === c.floor)!;
  const fl = shade(floor.color, -0.18);
  return (
    <defs>
      <pattern id={`${id}wall-render`} width="1" height="1" patternUnits="userSpaceOnUse"><rect width="1" height="1" fill="none" /></pattern>
      <pattern id={`${id}wall-timber`} width="0.18" height="10" patternUnits="userSpaceOnUse"><path d="M0 0V10" stroke={ink} strokeWidth="0.02" /></pattern>
      <pattern id={`${id}wall-brick`} width="0.46" height="0.15" patternUnits="userSpaceOnUse"><path d="M0 0H.46M0 .075H.46M.115 0V.075M.345 .075V.15" stroke={ink} strokeWidth="0.012" fill="none" /></pattern>
      <pattern id={`${id}wall-concrete`} width="1.5" height="1.2" patternUnits="userSpaceOnUse"><path d="M0 0H1.5M0 0V1.2" stroke={ink} strokeWidth="0.025" fill="none" /><circle cx=".3" cy=".3" r=".03" fill={ink} /><circle cx="1.2" cy=".3" r=".03" fill={ink} /><circle cx=".3" cy=".9" r=".03" fill={ink} /><circle cx="1.2" cy=".9" r=".03" fill={ink} /></pattern>
      <pattern id={`${id}floor-oak`} width="20" height="0.2" patternUnits="userSpaceOnUse"><path d="M0 0H20" stroke={fl} strokeWidth="0.02" /></pattern>
      <pattern id={`${id}floor-limestone`} width="0.9" height="0.6" patternUnits="userSpaceOnUse"><path d="M0 0H.9M0 0V.6" stroke={fl} strokeWidth="0.02" fill="none" /></pattern>
      <pattern id={`${id}floor-concrete`} width="3" height="3" patternUnits="userSpaceOnUse"><path d="M0 0H3M0 0V3" stroke={fl} strokeWidth="0.02" fill="none" /></pattern>
      <pattern id={`${id}floor-terrazzo`} width="0.5" height="0.5" patternUnits="userSpaceOnUse"><circle cx=".1" cy=".12" r=".025" fill={fl} /><circle cx=".33" cy=".3" r=".02" fill={shade(floor.color, -0.35)} /><circle cx=".2" cy=".42" r=".018" fill={fl} /><circle cx=".43" cy=".08" r=".015" fill={shade(floor.color, -0.3)} /></pattern>
    </defs>
  );
}

export function OpeningShape({ c, x, y, w, h, kind }: { c: Config; x: number; y: number; w: number; h: number; kind: "window" | "door" }) {
  const f = Math.min(0.08, w * 0.06);
  const glass = "#c4ced1";
  const mullion = c.frame;
  if (kind === "door")
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} fill={c.frame} />
        <rect x={x + f} y={y + f} width={w - 2 * f} height={h - f} fill={shade(c.frame, 0.12)} />
        <rect x={x + w * 0.38} y={y + h * 0.18} width={w * 0.24} height={h * 0.68} fill={glass} />
      </g>
    );
  const top = y + h;
  const archR = Math.min(w / 2, h / 2);
  const glassPath =
    c.windowStyle === "arched"
      ? `M${x + f} ${y + f}H${x + w - f}V${top - archR}C${x + w - f} ${top - archR + archR * 0.55} ${x + w / 2 + archR * 0.55} ${top - f} ${x + w / 2} ${top - f}C${x + w / 2 - archR * 0.55} ${top - f} ${x + f} ${top - archR + archR * 0.55} ${x + f} ${top - archR}Z`
      : `M${x + f} ${y + f}H${x + w - f}V${top - f}H${x + f}Z`;
  const outer =
    c.windowStyle === "arched"
      ? `M${x} ${y}H${x + w}V${top - archR}C${x + w} ${top - archR + archR * 0.56} ${x + w / 2 + archR * 0.56} ${top} ${x + w / 2} ${top}C${x + w / 2 - archR * 0.56} ${top} ${x} ${top - archR + archR * 0.56} ${x} ${top - archR}Z`
      : `M${x} ${y}H${x + w}V${top}H${x}Z`;
  const bars: string[] = [];
  if (c.windowStyle === "casement") bars.push(`M${x + w / 2} ${y}V${top}`, `M${x} ${y + h * 0.7}H${x + w}`);
  if (c.windowStyle === "slot") for (let i = 1; i < 3; i++) bars.push(`M${x + (w * i) / 3} ${y}V${top}`);
  if (c.windowStyle === "arched") bars.push(`M${x + w / 2} ${y}V${top}`);
  return (
    <g>
      <path d={outer} fill={c.frame} />
      <path d={glassPath} fill={glass} />
      <path d={`M${x + f} ${y + h * 0.35}L${x + w * 0.45} ${top - f}`} stroke="#e4eaeb" strokeWidth={Math.min(w, h) * 0.08} opacity="0.55" />
      {bars.map((d) => <path key={d} d={d} stroke={mullion} strokeWidth={f * 0.8} />)}
    </g>
  );
}

/** Axonometric drawing of the configured house; drag (or arrow keys) to turn it. */
export function House3D({ config, yaw: yawProp, interactive = true, label }: { config: Config; yaw?: number; interactive?: boolean; label: string }) {
  const uid = useId().replace(/:/g, "");
  const [yawState, setYaw] = useState(32);
  const [pitch, setPitch] = useState(24);
  const drag = useRef<{ x: number; y: number; yaw: number; pitch: number } | null>(null);
  const yaw = yawProp ?? yawState;
  const th = (yaw * Math.PI) / 180, ph = (pitch * Math.PI) / 180;
  const v: V3 = [Math.sin(th) * Math.cos(ph), Math.sin(ph), Math.cos(th) * Math.cos(ph)];
  const r: V3 = [Math.cos(th), 0, -Math.sin(th)];
  const u: V3 = [-Math.sin(th) * Math.sin(ph), Math.cos(ph), -Math.cos(th) * Math.sin(ph)];
  const cx = config.width / 2, cz = config.depth / 2;
  const P = (p: V3): [number, number] => {
    const q: V3 = [p[0] - cx, p[1], p[2] - cz];
    return [dot(q, r), -dot(q, u)];
  };
  const faces = buildFaces(config);
  const visible = faces.filter((f) => {
    const n = norm(cross(sub(f.pts[1], f.pts[0]), sub(f.pts[2], f.pts[0])));
    (f as Face & { n: V3 }).n = n;
    return dot(n, v) > 1e-3;
  }) as (Face & { n: V3 })[];
  // A fixed frame sized for the largest house, so resizing reads as the house growing.
  const frame: [number, number][] = [];
  // Halfway between the current footprint and the largest one, so resizing reads as the house growing without leaving the frame.
  const fx = (config.width + 16) / 4 + 1.2, fz = (config.depth + 14) / 4 + 1, fy = (wallHeight(config) + roofRise(config) + 14) / 2 + 0.6;
  for (const x of [-fx, fx]) for (const z of [-fz, fz + 1.6]) for (const y of [0, fy]) frame.push(P([cx + x, y, cz + z]));
  const xs = frame.map((p) => p[0]), ys = frame.map((p) => p[1]);
  const pad = 0.4;
  const vb = [Math.min(...xs) - pad, Math.min(...ys) - pad, Math.max(...xs) - Math.min(...xs) + 2 * pad, Math.max(...ys) - Math.min(...ys) + 2 * pad];

  const onDown = (e: RPE<SVGSVGElement>) => {
    if (!interactive) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, yaw: yawState, pitch };
  };
  const onMove = (e: RPE<SVGSVGElement>) => {
    if (!drag.current) return;
    setYaw(drag.current.yaw + (e.clientX - drag.current.x) * 0.4);
    setPitch(clamp(drag.current.pitch - (e.clientY - drag.current.y) * 0.2, 8, 40));
  };
  const onKey = (e: KeyboardEvent<SVGSVGElement>) => {
    const step = { ArrowLeft: [-8, 0], ArrowRight: [8, 0], ArrowUp: [0, 4], ArrowDown: [0, -4] }[e.key];
    if (!step) return;
    e.preventDefault();
    setYaw((y) => y + step[0]);
    setPitch((p) => clamp(p + step[1], 8, 40));
  };
  const ground = P([cx, 0, cz]);

  return (
    <svg
      className={interactive ? "house3d is-interactive" : "house3d"}
      viewBox={vb.join(" ")}
      role="img"
      aria-label={label}
      tabIndex={interactive ? 0 : -1}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
      onKeyDown={interactive ? onKey : undefined}
    >
      <Patterns id={uid} c={config} />
      <ellipse cx={ground[0]} cy={ground[1] + 0.3} rx={vb[2] * 0.38} ry={vb[2] * 0.38 * Math.sin(ph) * 0.9 + 0.2} fill="#1d2024" opacity="0.06" />
      {visible.map((f) => {
        const k = 0.55 + 0.45 * Math.max(0, dot(f.n, SUN));
        const fill = shade(f.fill, k - 1 + 0.08);
        const pts = f.pts.map(P);
        if (!f.frame) return <polygon key={f.key} points={pts.map((p) => p.join(",")).join(" ")} fill={fill} stroke={shade(f.fill, -0.35)} strokeWidth="0.02" strokeLinejoin="round" />;
        const o = P(f.frame.o);
        const s1 = P([f.frame.o[0] + f.frame.s[0], f.frame.o[1] + f.frame.s[1], f.frame.o[2] + f.frame.s[2]]);
        const t1 = P([f.frame.o[0] + f.frame.t[0], f.frame.o[1] + f.frame.t[1], f.frame.o[2] + f.frame.t[2]]);
        const m = [s1[0] - o[0], s1[1] - o[1], t1[0] - o[0], t1[1] - o[1], o[0], o[1]].map((n) => +n.toFixed(5));
        const poly = f.frame.local.map((p) => p.join(",")).join(" ");
        return (
          <g key={f.key} transform={`matrix(${m.join(" ")})`}>
            <polygon points={poly} fill={fill} />
            {f.frame.pattern && <polygon points={poly} fill={`url(#${uid}${f.frame.pattern})`} opacity="0.8" />}
            {f.frame.openings && config.openings.map((op) => <OpeningShape key={op.id} c={config} {...op} />)}
            <polygon points={poly} fill="none" stroke={shade(f.fill, -0.35)} strokeWidth="0.025" strokeLinejoin="round" />
          </g>
        );
      })}
    </svg>
  );
}
