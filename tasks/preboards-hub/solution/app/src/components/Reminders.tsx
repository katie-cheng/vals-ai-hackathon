import { BellRing } from "lucide-react";
import { longDate } from "../lib/time";
import { Button, Card, muted } from "./ui";

type Props = {
  notify: boolean;
  permission: NotificationPermission | "unsupported";
  onNotify: (on: boolean) => void;
  speakAlerts: boolean;
  onSpeakAlerts: (on: boolean) => void;
  nextMilestone: { days: number; at: string } | null;
  onTest: () => void;
};

function Switch({ id, checked, onChange, label, hint }: { id: string; checked: boolean; onChange: (v: boolean) => void; label: string; hint: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <label htmlFor={id} className="font-medium text-slate-900 dark:text-slate-100">
          {label}
        </label>
        <p className={`text-sm ${muted}`}>{hint}</p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-indigo-600 dark:bg-indigo-500" : "bg-slate-300 dark:bg-slate-600"}`}
      >
        <span className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}

const PERMISSION_TEXT = {
  granted: "Allowed. Alerts also appear as system notifications.",
  denied: "Blocked in your browser settings. Alerts still appear on this page.",
  default: "Your browser will ask for permission when you turn this on.",
  unsupported: "This browser has no notifications. Alerts appear on this page.",
};

export default function Reminders({ notify, permission, onNotify, speakAlerts, onSpeakAlerts, nextMilestone, onTest }: Props) {
  return (
    <Card id="reminders" title="Reminders">
      <div className="divide-y divide-slate-900/5 dark:divide-white/5">
        <Switch id="notify-switch" checked={notify} onChange={onNotify} label="Browser notifications" hint={notify ? PERMISSION_TEXT[permission] : "Off. Alerts appear on this page only."} />
        <Switch id="speak-switch" checked={speakAlerts} onChange={onSpeakAlerts} label="Read alerts aloud" hint="The companion speaks when a study session or break ends." />
      </div>
      <div className={`mt-2 space-y-1.5 text-sm ${muted}`}>
        <p>You are alerted when a goal reaches its due time, when a study session or break ends, and at 30, 14, 7, 3 and 1 days before the exam.</p>
        {nextMilestone && (
          <p>
            Next milestone: <span className="font-medium text-slate-800 dark:text-slate-200">{nextMilestone.days === 1 ? "1 day" : `${nextMilestone.days} days`} to go</span>, on {longDate(nextMilestone.at)}.
          </p>
        )}
      </div>
      <Button className="mt-4" onClick={onTest}>
        <BellRing className="size-4" aria-hidden="true" />
        Send a test alert
      </Button>
    </Card>
  );
}
