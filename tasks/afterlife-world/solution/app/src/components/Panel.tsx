import { X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Result } from "../server/types";

export function Panel({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, [title]);
  return (
    <aside ref={ref} className="panel" role="dialog" aria-label={title} tabIndex={-1}>
      <div className="panel-head">
        <h2>{title}</h2>
        <button type="button" className="icon-btn" aria-label={`Close ${title.toLowerCase()}`} onClick={onClose}>
          <X size={18} aria-hidden />
        </button>
      </div>
      <div className="panel-body">{children}</div>
    </aside>
  );
}

/** Runs a server request and keeps its outcome for display next to the control that sent it. */
export function useAction() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const run = async <T,>(req: Promise<Result<T>>, success?: string | ((d: T) => string)) => {
    setBusy(true);
    const r = await req;
    setBusy(false);
    if (r.ok) setMsg(success ? { ok: true, text: typeof success === "function" ? success(r.data) : success } : null);
    else setMsg({ ok: false, text: r.error });
    return r;
  };
  const Feedback = () => (msg ? <p className={msg.ok ? "feedback" : "feedback error"} role={msg.ok ? "status" : "alert"}>{msg.text}</p> : null);
  return { busy, run, Feedback, clear: () => setMsg(null) };
}

export const timeAgo = (t: number) => {
  const s = Math.round((Date.now() - t) / 1000);
  if (s < 45) return "just now";
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return new Date(t).toLocaleDateString([], { day: "numeric", month: "short" });
};

export const clock = (t: number) => new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
