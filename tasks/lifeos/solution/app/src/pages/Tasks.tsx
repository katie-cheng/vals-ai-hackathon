import { useMemo, useState } from "react";
import { Plus, Search, ListChecks } from "lucide-react";
import { useStore } from "../lib/store";
import { isOverdue, taskStats } from "../lib/stats";
import { TASK_CATEGORIES, type Task } from "../lib/types";
import { TaskRow } from "../components/TaskRow";
import { TaskModal } from "../components/TaskModal";
import { EmptyState } from "../components/Feedback";

type Status = "all" | "pending" | "completed" | "overdue";
type Sort = "due" | "created-desc" | "created-asc" | "priority";
const PRIO_RANK = { high: 0, medium: 1, low: 2 };

export function Tasks() {
  const { data } = useStore();
  const [q, setQ] = useState(() => new URLSearchParams(location.search).get("q") ?? "");
  const [status, setStatus] = useState<Status>("all");
  const [priority, setPriority] = useState("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<Sort>("due");
  const [editing, setEditing] = useState<Task | "new" | null>(null);
  const stats = taskStats(data.tasks);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    const out = data.tasks.filter((t) =>
      (!term || t.title.toLowerCase().includes(term) || t.notes.toLowerCase().includes(term) || t.category.toLowerCase().includes(term)) &&
      (status === "all" || (status === "completed" ? t.completed : status === "pending" ? !t.completed : isOverdue(t))) &&
      (priority === "all" || t.priority === priority) &&
      (category === "all" || t.category === category));
    const byDue = (a: Task, b: Task) => (a.due ?? "9999").localeCompare(b.due ?? "9999");
    out.sort((a, b) => {
      if (sort === "created-desc") return b.createdAt - a.createdAt;
      if (sort === "created-asc") return a.createdAt - b.createdAt;
      if (sort === "priority") return PRIO_RANK[a.priority] - PRIO_RANK[b.priority] || byDue(a, b);
      return Number(a.completed) - Number(b.completed) || byDue(a, b);
    });
    return out;
  }, [data.tasks, q, status, priority, category, sort]);

  const filtered = q || status !== "all" || priority !== "all" || category !== "all";
  const clear = () => { setQ(""); setStatus("all"); setPriority("all"); setCategory("all"); };

  return (
    <div className="stack">
      <section className="page-head">
        <p className="page-lead">{stats.pending} pending, {stats.completed} completed{stats.overdue > 0 && `, ${stats.overdue} overdue`}</p>
        <button type="button" className="btn btn-primary" onClick={() => setEditing("new")}><Plus size={16} />Add task</button>
      </section>

      <section className="card">
        <div className="toolbar">
          <div className="input-icon grow">
            <Search size={16} aria-hidden="true" />
            <input type="search" aria-label="Search tasks" placeholder="Search by title, notes or category" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="seg" role="group" aria-label="Filter by status">
            {(["all", "pending", "completed", "overdue"] as Status[]).map((s) => (
              <button type="button" key={s} aria-pressed={status === s} className={status === s ? "is-on" : ""} onClick={() => setStatus(s)}>
                {s === "all" ? "All" : s[0].toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <label className="select-label">
            <span className="sr-only">Filter by priority</span>
            <select aria-label="Filter by priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="all">Any priority</option>
              <option value="high">High priority</option>
              <option value="medium">Medium priority</option>
              <option value="low">Low priority</option>
            </select>
          </label>
          <label className="select-label">
            <span className="sr-only">Filter by category</span>
            <select aria-label="Filter by category" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="all">Any category</option>
              {TASK_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="select-label">
            <span className="sr-only">Sort tasks</span>
            <select aria-label="Sort tasks" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="due">Sort by deadline</option>
              <option value="created-desc">Newest first</option>
              <option value="created-asc">Oldest first</option>
              <option value="priority">Sort by priority</option>
            </select>
          </label>
        </div>

        {list.length === 0 ? (
          data.tasks.length === 0
            ? <EmptyState icon={<ListChecks size={20} />} title="No tasks yet" text="Create your first task to start planning your day." />
            : <EmptyState icon={<Search size={20} />} title="No matching tasks" text="Try a different search or clear the filters."
                action={<button type="button" className="btn btn-secondary" onClick={clear}>Clear filters</button>} />
        ) : (
          <>
            <p className="list-count" aria-live="polite">{filtered ? `${list.length} of ${data.tasks.length} tasks` : `${list.length} tasks`}</p>
            <ul className="task-list" aria-label="Tasks">{list.map((t) => <TaskRow key={t.id} task={t} onEdit={setEditing} />)}</ul>
          </>
        )}
      </section>
      {editing && <TaskModal task={editing === "new" ? undefined : editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
