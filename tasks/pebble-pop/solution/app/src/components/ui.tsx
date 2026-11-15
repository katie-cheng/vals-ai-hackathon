import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Link } from "../router.tsx";
import { audio } from "../audio/audio.ts";
import { pebbleImg, spriteImg, boosterImg } from "../game/assets.ts";
import type { Objective } from "../game/logic/types.ts";
import type { T } from "../state/i18n.ts";

type Variant = "primary" | "wood" | "plain" | "danger";

export function Button({ variant = "wood", className = "", onClick, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      className={`btn btn-${variant} ${className}`}
      onClick={(e) => {
        audio.play("button", 0.6);
        onClick?.(e);
      }}
      {...rest}
    />
  );
}

export function LinkButton({ to, variant = "wood", className = "", children, ...rest }: { to: string; variant?: Variant; className?: string; children: ReactNode; "aria-label"?: string }) {
  return (
    <Link to={to} className={`btn btn-${variant} ${className}`} onClick={() => audio.play("button", 0.6)} {...rest}>
      {children}
    </Link>
  );
}

/** Counts towards a new value instead of jumping, so score and move changes are noticeable. */
export function Counter({ value, className = "" }: { value: number; className?: string }) {
  const [shown, setShown] = useState(value);
  const [bump, setBump] = useState(0);
  const from = useRef(value);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    if (a === value) return;
    setBump((b) => b + 1);
    let raf = 0;
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / 420);
      const v = Math.round(a + (value - a) * (1 - Math.pow(1 - k, 3)));
      setShown(v);
      from.current = v;
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <span key={bump} className={`counter ${bump ? "counter-bump" : ""} ${className}`}>
      {shown.toLocaleString("en-US")}
    </span>
  );
}

export function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100));
  return (
    <span className="progress" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={Math.min(value, max)}>
      <span className="progress-fill" style={{ width: `${pct}%` }} />
    </span>
  );
}

export function Stars({ count, size = 22, animate = false, label }: { count: number; size?: number; animate?: boolean; label?: string }) {
  return (
    <span className={`stars ${animate ? "stars-animate" : ""}`} role="img" aria-label={label ?? `${count} / 3`}>
      {[0, 1, 2].map((i) => (
        <img key={i} src={spriteImg(i < count ? "star" : "star-empty")} alt="" width={size} height={size} style={{ animationDelay: `${300 + i * 380}ms` }} className={i < count ? "star-on" : "star-off"} />
      ))}
    </span>
  );
}

export function Modal({ title, children, onClose, wide = false, labelId }: { title: string; children: ReactNode; onClose?: () => void; wide?: boolean; labelId: string }) {
  useEffect(() => {
    if (!onClose) return;
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  }, [onClose]);
  return (
    <div className="modal-backdrop">
      <div className={`modal parchment ${wide ? "modal-wide" : ""}`} role="dialog" aria-modal="true" aria-labelledby={labelId}>
        <h2 id={labelId} className="modal-title">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}

export function objectiveIcon(o: Objective): string {
  switch (o.type) {
    case "collect":
      return pebbleImg(o.color);
    case "frozen":
      return spriteImg("frozen");
    case "flowers":
      return spriteImg("flower");
    case "stones":
      return spriteImg("stone");
    case "locks":
      return spriteImg("lock");
    case "score":
      return spriteImg("star");
  }
}

export function objectiveText(t: T, o: Objective, n = o.target): string {
  switch (o.type) {
    case "collect":
      return t("obj_collect", { n, color: t(o.color) });
    case "frozen":
      return t("obj_frozen", { n });
    case "flowers":
      return t("obj_flowers", { n });
    case "stones":
      return t("obj_stones", { n });
    case "locks":
      return t("obj_locks", { n });
    case "score":
      return t("obj_score", { n: n.toLocaleString("en-US") });
  }
}

export function Wallet({ acorns, crystals, t }: { acorns: number; crystals: number; t: T }) {
  return (
    <div className="wallet">
      <span className="wallet-item" title={t("acorns")}>
        <img src={spriteImg("acorn")} alt={t("acorns")} width={26} height={26} />
        <Counter value={acorns} />
      </span>
      <span className="wallet-item" title={t("crystals")}>
        <img src={spriteImg("crystal")} alt={t("crystals")} width={26} height={26} />
        <Counter value={crystals} />
      </span>
    </div>
  );
}

export { boosterImg };
