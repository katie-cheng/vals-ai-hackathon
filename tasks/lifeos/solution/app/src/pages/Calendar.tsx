import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, CalendarDays } from "lucide-react";
import { useStore } from "../lib/store";
import { isoDate, longDate, monthLabel, parseIso, todayIso } from "../lib/dates";
import { TaskRow } from "../components/TaskRow";
import { TaskModal } from "../components/TaskModal";
import { EmptyState } from "../components/Feedback";
import type { Task } from "../lib/types";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function Calendar() {
  const { data } = useStore();
  const today = todayIso();
  const [cursor, setCursor] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [selected, setSelected] = useState(today);
  const [editing, setEditing] = useState<Task | "new" | null>(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const lead = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysIn = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [...Array(lead).fill(null), ...Array.from({ length: daysIn }, (_, i) => isoDate(new Date(year, month, i + 1)))];
  while (cells.length % 7) cells.push(null);

  const byDay = new Map<string, Task[]>();
  for (const t of data.tasks) if (t.due) byDay.set(t.due, [...(byDay.get(t.due) ?? []), t]);
  const dayTasks = (byDay.get(selected) ?? []).slice().sort((a, b) => Number(a.completed) - Number(b.completed));
  const shift = (n: number) => setCursor(new Date(year, month + n, 1));
  const goToday = () => { const d = new Date(); setCursor(new Date(d.getFullYear(), d.getMonth(), 1)); setSelected(today); };

  return (
    <div className="calendar-layout">
      <section className="card calendar-card" aria-labelledby="month-h">
        <header className="cal-head">
          <h2 id="month-h" aria-live="polite">{monthLabel(cursor)}</h2>
          <div className="cal-nav">
            <button type="button" className="btn btn-secondary btn-sm" onClick={goToday}>Today</button>
            <button type="button" className="icon-btn" aria-label="Previous month" onClick={() => shift(-1)}><ChevronLeft size={18} /></button>
            <button type="button" className="icon-btn" aria-label="Next month" onClick={() => shift(1)}><ChevronRight size={18} /></button>
          </div>
        </header>
        <div className="cal-grid" role="grid" aria-labelledby="month-h">
          <div className="cal-row" role="row">
            {WEEKDAYS.map((w) => <span key={w} className="cal-wd" role="columnheader">{w}</span>)}
          </div>
          {Array.from({ length: cells.length / 7 }, (_, r) => (
            <div className="cal-row" role="row" key={r}>
              {cells.slice(r * 7, r * 7 + 7).map((iso, i) => {
                if (!iso) return <span key={i} className="cal-cell is-blank" role="gridcell" />;
                const tasks = byDay.get(iso) ?? [];
                const open = tasks.filter((t) => !t.completed).length;
                const label = `${longDate(parseIso(iso))}, ${tasks.length ? `${tasks.length} tasks, ${open} open` : "no tasks"}`;
                return (
                  <button type="button" role="gridcell" key={iso} data-date={iso} aria-label={label} aria-selected={iso === selected}
                    aria-current={iso === today ? "date" : undefined}
                    className={`cal-cell${iso === today ? " is-today" : ""}${iso === selected ? " is-selected" : ""}`} onClick={() => setSelected(iso)}>
                    <span className="cal-num">{parseIso(iso).getDate()}</span>
                    {tasks.length > 0 && (
                      <span className="cal-marks" aria-hidden="true">
                        {tasks.slice(0, 3).map((t) => <span key={t.id} className={`cal-mark${t.completed ? " is-done" : ` prio-${t.priority}`}`} />)}
                      </span>
                    )}
                    <span className="cal-titles" aria-hidden="true">
                      {tasks.slice(0, 2).map((t) => <span key={t.id} className={t.completed ? "is-done" : ""}>{t.title}</span>)}
                      {tasks.length > 2 && <span className="cal-more">{tasks.length - 2} more</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </section>
      <section className="card day-panel" aria-labelledby="day-h">
        <header className="card-head">
          <h3 id="day-h">{selected === today ? "Today" : longDate(parseIso(selected))}</h3>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setEditing("new")}><Plus size={16} />Add task for this day</button>
        </header>
        {dayTasks.length === 0 ? (
          <EmptyState icon={<CalendarDays size={20} />} title="Nothing scheduled" text="Tasks due on this day appear here." />
        ) : (
          <>
            <p className="list-count">{dayTasks.filter((t) => t.completed).length} of {dayTasks.length} completed</p>
            <ul className="task-list">{dayTasks.map((t) => <TaskRow key={t.id} task={t} onEdit={setEditing} />)}</ul>
          </>
        )}
      </section>
      {editing && <TaskModal task={editing === "new" ? undefined : editing} defaultDue={selected} onClose={() => setEditing(null)} />}
    </div>
  );
}
