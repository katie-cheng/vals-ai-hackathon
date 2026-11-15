import { CheckCircle2, Info, AlertTriangle, X } from "lucide-react";
import { useStore } from "../lib/store";
import { Modal } from "./Modal";

export function Toasts() {
  const { toasts, dismissToast } = useStore();
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.tone}`}>
          {t.tone === "success" ? <CheckCircle2 size={18} /> : t.tone === "danger" ? <AlertTriangle size={18} /> : <Info size={18} />}
          <p>{t.message}</p>
          <button type="button" className="icon-btn" aria-label="Dismiss notification" onClick={() => dismissToast(t.id)}><X size={16} /></button>
        </div>
      ))}
    </div>
  );
}

export function ConfirmDialog() {
  const { confirm, closeConfirm } = useStore();
  if (!confirm) return null;
  return (
    <Modal title={confirm.title} onClose={closeConfirm} size="sm" footer={<>
      <button type="button" className="btn btn-secondary" onClick={closeConfirm}>Cancel</button>
      <button type="button" className="btn btn-danger" onClick={() => { confirm.onConfirm(); closeConfirm(); }}>{confirm.confirmLabel}</button>
    </>}>
      <p className="confirm-text">{confirm.message}</p>
    </Modal>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: React.ReactNode; title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="empty">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}
