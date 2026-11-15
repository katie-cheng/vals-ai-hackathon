import { useEffect, useLayoutEffect, useRef, useState, type Dispatch, type SetStateAction, type PointerEvent as RPE, type KeyboardEvent } from "react";
import { type Config, type Opening, LIMITS, clamp, fitOpenings, roofRise, round1, wallHeight } from "./model";
import { OpeningShape } from "./House3D";

type Drag =
  | { mode: "move" | "resize"; id: string; x: number; y: number; start: Opening }
  | { mode: "width"; x: number; start: number }
  | { mode: "height"; y: number; start: number }
  | { mode: "add"; kind: Opening["kind"]; x: number; y: number };

const BASE = 34;
const count = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function Facade({ config, setConfig, selected, setSelected }: {
  config: Config;
  setConfig: Dispatch<SetStateAction<Config>>;
  selected: string | null;
  setSelected: (id: string | null) => void;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const wallRef = useRef<HTMLDivElement>(null);
  const [cw, setCw] = useState(720);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [ghost, setGhost] = useState<{ x: number; y: number } | null>(null);
  const seq = useRef(10);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setCw(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const s = Math.min(BASE, (cw - 32) / (LIMITS.width[1] + 1));
  const W = config.width, H = wallHeight(config), rise = roofRise(config);
  const ox = Math.max(16, (cw - LIMITS.width[1] * s) / 2);
  const bottom = 40;
  const hPx = bottom + (H + rise + 0.9) * s + 24;

  const update = (fn: (c: Config) => Partial<Config>) =>
    setConfig((c) => {
      const next = { ...c, ...fn(c) };
      return { ...next, openings: fitOpenings(next) };
    });
  const patchOpening = (id: string, fn: (o: Opening) => Partial<Opening>) =>
    update((c) => ({ openings: c.openings.map((o) => (o.id === id ? { ...o, ...fn(o) } : o)) }));

  useLayoutEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => {
      if (drag.mode === "add") return setGhost({ x: e.clientX, y: e.clientY });
      if (drag.mode === "width") return update(() => ({ width: round1(clamp(drag.start + (e.clientX - drag.x) / s, ...LIMITS.width)) }));
      if (drag.mode === "height")
        return update((c) => ({ storeyHeight: round1(clamp(drag.start + -(e.clientY - drag.y) / s / c.storeys, ...LIMITS.storeyHeight)) }));
      const dx = (e.clientX - drag.x) / s, dy = -(e.clientY - drag.y) / s;
      const o = drag.start;
      if (drag.mode === "move") patchOpening(drag.id, () => ({ x: round1(o.x + dx), y: round1(o.y + dy) }));
      else patchOpening(drag.id, () => ({ w: round1(clamp(o.w + dx, 0.5, 6)), h: round1(clamp(o.h + dy, 0.5, 4)) }));
    };
    const up = (e: PointerEvent) => {
      if (drag.mode === "add") {
        const r = wallRef.current?.getBoundingClientRect();
        if (r && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom)
          addOpening(drag.kind, (e.clientX - r.left) / s, (r.bottom - e.clientY) / s);
        setGhost(null);
      }
      setDrag(null);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  });

  function addOpening(kind: Opening["kind"], cx?: number, cy?: number) {
    const id = `o${seq.current++}`;
    update((c) => {
      const w = kind === "door" ? 1.1 : 1.6, h = kind === "door" ? 2.3 : 1.3;
      const x = cx === undefined ? c.width / 2 - w / 2 : cx - w / 2;
      const y = kind === "door" ? 0 : cy === undefined ? wallHeight(c) - c.storeyHeight / 2 - h / 2 : cy - h / 2;
      return { openings: [...c.openings, { id, kind, x: round1(x), y: round1(y), w, h }] };
    });
    setSelected(id);
  }

  const startOpening = (e: RPE, o: Opening, mode: "move" | "resize") => {
    e.preventDefault();
    e.stopPropagation();
    setSelected(o.id);
    setDrag({ mode, id: o.id, x: e.clientX, y: e.clientY, start: o });
  };
  const keyOpening = (e: KeyboardEvent, o: Opening) => {
    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      update((c) => ({ openings: c.openings.filter((x) => x.id !== o.id) }));
      return setSelected(null);
    }
    const d = { ArrowLeft: [-0.1, 0], ArrowRight: [0.1, 0], ArrowUp: [0, 0.1], ArrowDown: [0, -0.1] }[e.key];
    if (!d) return;
    e.preventDefault();
    patchOpening(o.id, (p) => (e.shiftKey ? { w: round1(clamp(p.w + d[0], 0.5, 6)), h: round1(clamp(p.h + d[1], 0.5, 4)) } : { x: round1(p.x + d[0]), y: round1(p.y + d[1]) }));
  };
  const keyWall = (e: KeyboardEvent, axis: "width" | "height") => {
    const d = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key];
    if (!d) return;
    e.preventDefault();
    if (axis === "width") update((c) => ({ width: round1(clamp(c.width + d * 0.1, ...LIMITS.width)) }));
    else update((c) => ({ storeyHeight: round1(clamp(c.storeyHeight + d * 0.1, ...LIMITS.storeyHeight)) }));
  };

  const vb = [-ox / s, -(hPx - bottom) / s, cw / s, hPx / s];
  const o = 0.35;
  const roofShape =
    config.roof === "hip"
      ? W >= config.depth
        ? `M${-o} ${H}H${W + o}L${W - config.depth / 2} ${H + rise}H${config.depth / 2}Z`
        : `M${-o} ${H}H${W + o}L${W / 2} ${H + rise}Z`
      : `M${-o} ${H}H${W + o}V${H + rise}H${-o}Z`;
  const sel = config.openings.find((x) => x.id === selected);

  return (
    <div className="facade-editor">
      <div className="facade-tools">
        <p className="facade-hint">Drag a window or door onto the wall. Drag openings to move them, their corner to resize, and the wall edges to change width and height.</p>
        <div className="palette" aria-label="Openings to add">
          {(["window", "door"] as const).map((k) => (
            <button
              key={k}
              type="button"
              className="palette-item"
              onPointerDown={(e) => {
                e.preventDefault();
                setDrag({ mode: "add", kind: k, x: e.clientX, y: e.clientY });
                setGhost({ x: e.clientX, y: e.clientY });
              }}
              onClick={(e) => {
                if (e.detail === 0) addOpening(k);
              }}
            >
              <svg viewBox="0 0 20 20" aria-hidden="true">{k === "window" ? <path d="M3 4h14v12H3zM10 4v12M3 11h14" /> : <path d="M6 2h8v16H6zM12 10v1" />}</svg>
              Add a {k}
            </button>
          ))}
        </div>
      </div>
      <div ref={wrap} className={drag ? "facade is-dragging" : "facade"} style={{ height: hPx }} onPointerDown={() => setSelected(null)}>
        <svg className="facade-drawing" viewBox={vb.join(" ")} aria-hidden="true">
          <g transform="scale(1,-1)">
            <rect x={-1.2} y={-0.3} width={W + 2.4} height={0.3} fill="#cfcac1" />
            <path d={roofShape} fill={config.roofCovering} />
            <rect x={0} y={0} width={W} height={H} fill={config.paint} stroke="#8d8a84" strokeWidth={0.03} />
            {Array.from({ length: config.storeys - 1 }, (_, i) => (
              <path key={i} d={`M0 ${(i + 1) * config.storeyHeight}H${W}`} stroke="#8d8a84" strokeWidth={0.02} strokeDasharray="0.15 0.12" />
            ))}
            {config.openings.map((op) => <OpeningShape key={op.id} c={config} {...op} />)}
          </g>
        </svg>
        <div ref={wallRef} className="facade-wall" style={{ left: ox, bottom, width: W * s, height: H * s }} aria-label="Front façade">
          {config.openings.map((op, i) => (
            <div
              key={op.id}
              className={op.id === selected ? "opening is-selected" : "opening"}
              style={{ left: op.x * s, bottom: op.y * s, width: op.w * s, height: op.h * s }}
              tabIndex={0}
              role="group"
              aria-label={`${op.kind === "door" ? "Door" : "Window"} ${i + 1}, ${op.w.toFixed(1)} by ${op.h.toFixed(1)} m. Arrow keys move it, Shift and arrow keys resize it, Delete removes it.`}
              onPointerDown={(e) => startOpening(e, op, "move")}
              onFocus={() => setSelected(op.id)}
              onKeyDown={(e) => keyOpening(e, op)}
            >
              <span className="opening-handle" aria-hidden="true" onPointerDown={(e) => startOpening(e, op, "resize")} />
            </div>
          ))}
          <div
            className="wall-handle wall-handle-x"
            role="slider"
            tabIndex={0}
            aria-label="Façade width"
            aria-valuemin={LIMITS.width[0]}
            aria-valuemax={LIMITS.width[1]}
            aria-valuenow={W}
            aria-valuetext={`${W.toFixed(1)} metres`}
            onKeyDown={(e) => keyWall(e, "width")}
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDrag({ mode: "width", x: e.clientX, start: W });
            }}
          />
          <div
            className="wall-handle wall-handle-y"
            role="slider"
            tabIndex={0}
            aria-label="Storey height"
            aria-valuemin={LIMITS.storeyHeight[0]}
            aria-valuemax={LIMITS.storeyHeight[1]}
            aria-valuenow={config.storeyHeight}
            aria-valuetext={`${config.storeyHeight.toFixed(1)} metres per storey`}
            onKeyDown={(e) => keyWall(e, "height")}
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDrag({ mode: "height", y: e.clientY, start: config.storeyHeight });
            }}
          />
          <span className="dim dim-w">{W.toFixed(1)} m</span>
          <span className="dim dim-h">{H.toFixed(1)} m</span>
        </div>
      </div>
      <div className="facade-status" aria-live="polite">
        {sel ? (
          <>
            <span>
              {sel.kind === "door" ? "Door" : "Window"} selected: {sel.w.toFixed(1)} by {sel.h.toFixed(1)} m, {sel.x.toFixed(1)} m from the left
            </span>
            <button type="button" className="text-button" onClick={() => { update((c) => ({ openings: c.openings.filter((x) => x.id !== sel.id) })); setSelected(null); }}>
              Remove
            </button>
          </>
        ) : (
          <span>{count(config.openings.filter((x) => x.kind === "window").length, "window")} and {count(config.openings.filter((x) => x.kind === "door").length, "door")} on the front façade</span>
        )}
      </div>
      {ghost && drag?.mode === "add" && <div className={`drag-ghost drag-ghost-${drag.kind}`} style={{ left: ghost.x, top: ghost.y, width: (drag.kind === "door" ? 1.1 : 1.6) * s, height: (drag.kind === "door" ? 2.3 : 1.3) * s }} aria-hidden="true" />}
    </div>
  );
}
