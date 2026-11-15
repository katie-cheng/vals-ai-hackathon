import { useMemo, useState } from "react";
import { Plus, Timer, NotebookPen, Flame, ArrowRight } from "lucide-react";
import { Link, useRouter } from "../lib/router";
import { useStore } from "../lib/store";
import { greeting, lastDays, longDate, todayIso, weekday, dueLabel } from "../lib/dates";
import { completedOn, focusMinutesOn, habitStreak, isOverdue, taskStats, weeklyScore } from "../lib/stats";
import { TaskRow, Checkbox } from "../components/TaskRow";
import { TaskModal } from "../components/TaskModal";
import { ChartCanvas, baseScales, themeColors } from "../components/Chart";
import { EmptyState } from "../components/Feedback";

export function Overview() {
  const { data, toggleHabit, toast } = useStore();
  const { navigate } = useRouter();
  const [creating, setCreating] = useState(false);
  const today = todayIso();
  const stats = taskStats(data.tasks);
  const week = weeklyScore(data);
  const lastWeek = weeklyScore(data, lastDays(8)[0]);
  const todays = data.tasks
    .filter((t) => (t.due === today) || (isOverdue(t)) || (t.completed && t.completedAt && new Date(t.completedAt).toDateString() === new Date().toDateString()))
    .sort((a, b) => Number(a.completed) - Number(b.completed) || (a.due ?? "").localeCompare(b.due ?? ""));
  const upcoming = data.tasks.filter((t) => !t.completed && t.due && t.due > today).sort((a, b) => a.due!.localeCompare(b.due!)).slice(0, 5);
  const habitsDone = data.habits.filter((h) => h.done.includes(today)).length;
  const doneToday = completedOn(data.tasks, today);
  const focusToday = focusMinutesOn(data, today);
  const days = lastDays(7);
  const c = themeColors(data.settings.theme);

  const chart = useMemo(() => ({
    type: "bar" as const,
    data: {
      labels: days.map((d) => (d === today ? "Today" : weekday(d))),
      datasets: [{ label: "Tasks completed", data: days.map((d) => completedOn(data.tasks, d)), backgroundColor: c.accent, borderRadius: 6, maxBarThickness: 28 }],
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: baseScales(data.settings.theme, { stepSize: 1 }) },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [data.tasks, data.settings.theme]);

  const delta = week.score - lastWeek.score;
  return (
    <div className="stack">
      <section className="hello">
        <div>
          <h2 className="hello-title">{greeting()}, {data.settings.name}</h2>
          <p className="hello-sub">
            {longDate()}. You've finished {doneToday} of {doneToday + stats.dueToday + stats.overdue} tasks for today, checked off {habitsDone} of {data.habits.length} habits and focused for {focusToday} minutes.
          </p>
        </div>
        <div className="quick-actions" aria-label="Quick actions">
          <button type="button" className="btn btn-primary" onClick={() => setCreating(true)}><Plus size={16} />New task</button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate("/focus")}><Timer size={16} />Start focus</button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate("/notes?new=1")}><NotebookPen size={16} />New note</button>
        </div>
      </section>

      <section className="stat-grid" aria-label="Summary">
        <div className="stat"><p className="stat-label">Total tasks</p><p className="stat-value">{stats.total}</p><p className="stat-note">{stats.dueToday} due today</p></div>
        <div className="stat"><p className="stat-label">Completed</p><p className="stat-value">{stats.completed}</p><p className="stat-note">{Math.round(stats.rate * 100)}% of all tasks</p></div>
        <div className="stat"><p className="stat-label">Pending</p><p className="stat-value">{stats.pending}</p><p className={`stat-note${stats.overdue ? " is-overdue" : ""}`}>{stats.overdue} overdue</p></div>
        <div className="stat"><p className="stat-label">Active habits</p><p className="stat-value">{data.habits.length}</p><p className="stat-note">{habitsDone} done today</p></div>
        <div className="stat"><p className="stat-label">Weekly productivity score</p><p className="stat-value">{week.score}<span className="stat-unit"> / 100</span></p>
          <p className="stat-note">{delta === 0 ? "Same as last week" : `${delta > 0 ? "Up" : "Down"} ${Math.abs(delta)} points from last week`}</p></div>
      </section>

      <div className="grid-2">
        <section className="card" aria-labelledby="today-h">
          <header className="card-head">
            <h3 id="today-h">Today's tasks</h3>
            <Link to="/tasks" className="text-link">Open My Tasks<ArrowRight size={14} /></Link>
          </header>
          {todays.length === 0 ? (
            <EmptyState icon={<Plus size={20} />} title="Nothing due today" text="Add a task or enjoy the free time." />
          ) : (
            <ul className="task-list">{todays.slice(0, 7).map((t) => <TaskRow key={t.id} task={t} compact />)}</ul>
          )}
        </section>

        <section className="card" aria-labelledby="habits-h">
          <header className="card-head">
            <h3 id="habits-h">Habits today</h3>
            <Link to="/habits" className="text-link">Open Habits<ArrowRight size={14} /></Link>
          </header>
          <div className="progress-line">
            <div className="progress" role="progressbar" aria-label="Habits completed today" aria-valuemin={0} aria-valuemax={data.habits.length} aria-valuenow={habitsDone}>
              <div className="progress-fill" style={{ width: `${data.habits.length ? (habitsDone / data.habits.length) * 100 : 0}%` }} />
            </div>
            <p className="progress-text">{habitsDone} of {data.habits.length} done</p>
          </div>
          {data.habits.length === 0 ? (
            <EmptyState icon={<Flame size={20} />} title="No habits yet" text="Start with one small daily habit." />
          ) : (
            <ul className="habit-mini">
              {data.habits.map((h) => {
                const done = h.done.includes(today);
                return (
                  <li key={h.id}>
                    <Checkbox checked={done} label={`Mark "${h.name}" done today`} onChange={() => { toggleHabit(h.id, today); toast(done ? `Unchecked "${h.name}"` : `Checked off "${h.name}"`); }} />
                    <span className="habit-mini-name">{h.name}</span>
                    <span className="habit-mini-streak">{habitStreak(h)} day streak</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="card" aria-labelledby="chart-h">
          <header className="card-head">
            <h3 id="chart-h">Weekly productivity</h3>
            <p className="card-sub">{week.tasksDone} tasks completed this week</p>
          </header>
          <ChartCanvas config={chart} label="Tasks completed on each of the last seven days" height={220} />
        </section>

        <section className="card" aria-labelledby="deadlines-h">
          <header className="card-head">
            <h3 id="deadlines-h">Upcoming deadlines</h3>
            <Link to="/calendar" className="text-link">Open Calendar<ArrowRight size={14} /></Link>
          </header>
          {upcoming.length === 0 ? (
            <EmptyState icon={<Plus size={20} />} title="No upcoming deadlines" text="Tasks with a future due date show up here." />
          ) : (
            <ul className="deadlines">
              {upcoming.map((t) => (
                <li key={t.id}>
                  <span className={`prio-dot prio-${t.priority}`} aria-hidden="true" />
                  <span className="deadline-title">{t.title}</span>
                  <time dateTime={t.due!}>{dueLabel(t.due!)}</time>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      {creating && <TaskModal onClose={() => setCreating(false)} />}
    </div>
  );
}
