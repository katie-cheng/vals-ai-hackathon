import { useRef, useState } from "react";

interface Props {
  label: string;
  side: "left" | "right";
  onChange: (x: number, y: number) => void;
}

const RADIUS = 48;

/** A virtual thumbstick. x runs left to right and y bottom to top, each from -1 to 1. */
export function Joystick({ label, side, onChange }: Props) {
  const base = useRef<HTMLDivElement>(null);
  const active = useRef<number | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  const update = (clientX: number, clientY: number) => {
    const r = base.current!.getBoundingClientRect();
    let dx = clientX - (r.left + r.width / 2);
    let dy = clientY - (r.top + r.height / 2);
    const d = Math.hypot(dx, dy);
    if (d > RADIUS) (dx = (dx / d) * RADIUS), (dy = (dy / d) * RADIUS);
    setKnob({ x: dx, y: dy });
    onChange(dx / RADIUS, -dy / RADIUS);
  };
  const release = () => {
    active.current = null;
    setKnob({ x: 0, y: 0 });
    onChange(0, 0);
  };

  return (
    <div
      ref={base}
      className={`stick stick-${side}`}
      role="application"
      aria-label={label}
      onPointerDown={(e) => {
        active.current = e.pointerId;
        e.currentTarget.setPointerCapture(e.pointerId);
        update(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => e.pointerId === active.current && update(e.clientX, e.clientY)}
      onPointerUp={release}
      onPointerCancel={release}
    >
      <span className="stick-knob" style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }} />
      <span className="stick-label">{label.replace(" joystick", "")}</span>
    </div>
  );
}
