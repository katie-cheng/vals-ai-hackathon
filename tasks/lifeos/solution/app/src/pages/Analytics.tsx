import { useMemo } from "react";
import { useStore } from "../lib/store";
import { lastDays, todayIso, weekday, shortDate, addDays } from "../lib/dates";
import { completedOn, focusMinutesOn, habitRate, taskStats, weeklyScore } from "../lib/stats";
import { ChartCanvas, baseScales, themeColors } from "../components/Chart";
import { PRIORITIES, PRIORITY_LABEL } from "../lib/types";

export function Analytics() {
  const { data } = useStore();
  const theme = data.settings.theme;
  const c = themeColors(theme);
  const today = todayIso();
  const stats = taskStats(data.tasks);
  const days14 = lastDays(14);
  const weeks = [7, 6, 5, 4, 3, 2, 1, 0].map((w) => addDays(today, -7 * w));
  const focus7 = lastDays(7).reduce((n, d) => n + focusMinutesOn(data, d), 0);
  const plain = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };

  const daily = useMemo(() => ({
    type: "bar" as const,
    data: { labels: days14.map((d) => (d === today ? "Today" : shortDate(d))), datasets: [{ label: "Tasks completed", data: days14.map((d) => completedOn(data.tasks, d)), backgroundColor: c.accent, borderRadius: 6, maxBarThickness: 22 }] },
    options: { ...plain, scales: baseScales(theme, { stepSize: 1 }) },
  }), [data.tasks, theme]); // eslint-disable-line react-hooks/exhaustive-deps

  const trend = useMemo(() => ({
    type: "line" as const,
    data: { labels: weeks.map((w) => (w === today ? "This week" : `Week of ${shortDate(addDays(w, -6))}`)), datasets: [{ label: "Productivity score", data: weeks.map((w) => weeklyScore(data, w).score), borderColor: c.accent, backgroundColor: c.accentSoft, fill: true, tension: 0.35, pointRadius: 3 }] },
    options: { ...plain, scales: baseScales(theme, { max: 100 }) },
  }), [data, theme]); // eslint-disable-line react-hooks/exhaustive-deps

  const habits = useMemo(() => ({
    type: "bar" as const,
    data: { labels: data.habits.map((h) => h.name), datasets: [{ label: "Days done in the last 30 days (%)", data: data.habits.map((h) => Math.round(habitRate(h) * 100)), backgroundColor: c.low, borderRadius: 6, maxBarThickness: 20 }] },
    options: { ...plain, indexAxis: "y" as const, scales: { x: { ...baseScales(theme, { max: 100 }).y }, y: { ...baseScales(theme).x } } },
  }), [data.habits, theme]); // eslint-disable-line react-hooks/exhaustive-deps

  const focus = useMemo(() => {
    const days = lastDays(7);
    return {
      type: "bar" as const,
      data: { labels: days.map((d) => (d === today ? "Today" : weekday(d))), datasets: [{ label: "Focus hours", data: days.map((d) => +(focusMinutesOn(data, d) / 60).toFixed(2)), backgroundColor: c.medium, borderRadius: 6, maxBarThickness: 28 }] },
      options: { ...plain, scales: { ...baseScales(theme), y: { ...baseScales(theme).y, ticks: { ...baseScales(theme).y.ticks, precision: 1 } } } },
    };
  }, [data.sessions, theme]); // eslint-disable-line react-hooks/exhaustive-deps

  const priority = useMemo(() => ({
    type: "doughnut" as const,
    data: { labels: PRIORITIES.map((p) => PRIORITY_LABEL[p]), datasets: [{ label: "Tasks", data: PRIORITIES.map((p) => data.tasks.filter((t) => t.priority === p).length), backgroundColor: [c.high, c.medium, c.low], borderWidth: 0 }] },
    options: { ...plain, cutout: "64%", plugins: { legend: { display: true, position: "bottom" as const, labels: { boxWidth: 10, boxHeight: 10, usePointStyle: true } } } },
  }), [data.tasks, theme]); // eslint-disable-line react-hooks/exhaustive-deps

  const completion = useMemo(() => ({
    type: "doughnut" as const,
    data: { labels: ["Completed", "Pending"], datasets: [{ label: "Tasks", data: [stats.completed, stats.pending], backgroundColor: [c.accent, c.muted], borderWidth: 0 }] },
    options: { ...plain, cutout: "72%", plugins: { legend: { display: true, position: "bottom" as const, labels: { boxWidth: 10, boxHeight: 10, usePointStyle: true } } } },
  }), [stats.completed, stats.pending, theme]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="analytics-grid">
      <section className="card span-2" aria-labelledby="a-daily">
        <header className="card-head"><h3 id="a-daily">Daily task completion</h3><p className="card-sub">Last 14 days</p></header>
        <ChartCanvas config={daily} label="Tasks completed per day over the last 14 days" />
      </section>
      <section className="card" aria-labelledby="a-rate">
        <header className="card-head"><h3 id="a-rate">Overall completion rate</h3><p className="card-sub">{Math.round(stats.rate * 100)}% complete</p></header>
        <ChartCanvas config={completion} label={`${stats.completed} completed and ${stats.pending} pending tasks`} />
      </section>
      <section className="card span-2" aria-labelledby="a-trend">
        <header className="card-head"><h3 id="a-trend">Weekly productivity trend</h3><p className="card-sub">Score out of 100, last 8 weeks</p></header>
        <ChartCanvas config={trend} label="Weekly productivity score for the last eight weeks" />
      </section>
      <section className="card" aria-labelledby="a-prio">
        <header className="card-head"><h3 id="a-prio">Tasks by priority</h3><p className="card-sub">{stats.total} tasks</p></header>
        <ChartCanvas config={priority} label="Number of tasks at each priority" />
      </section>
      <section className="card span-2" aria-labelledby="a-habit">
        <header className="card-head"><h3 id="a-habit">Habit consistency</h3><p className="card-sub">Share of days done, last 30 days</p></header>
        <ChartCanvas config={habits} label="Completion rate per habit over the last 30 days" />
      </section>
      <section className="card" aria-labelledby="a-focus">
        <header className="card-head"><h3 id="a-focus">Focus hours</h3><p className="card-sub">{(focus7 / 60).toFixed(1)} hours this week</p></header>
        <ChartCanvas config={focus} label="Focus hours per day over the last seven days" />
      </section>
    </div>
  );
}
