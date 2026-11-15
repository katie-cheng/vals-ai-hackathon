import { X } from "lucide-react";
import type { Toast } from "../lib/notify";

export default function Toasts({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-40 flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-96" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="glass toast-in pointer-events-auto flex w-full items-start gap-3 rounded-xl p-4" data-toast>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-900 dark:text-white">{t.title}</p>
            <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">{t.body}</p>
          </div>
          <button type="button" onClick={() => onDismiss(t.id)} className="rounded-md p-1 text-slate-500 hover:bg-slate-900/5 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white" aria-label="Dismiss alert">
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}
