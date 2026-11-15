import { useEffect, useRef } from "react";
import {
  ArcElement, BarController, BarElement, CategoryScale, Chart, DoughnutController, Filler, Legend, LinearScale,
  LineController, LineElement, PointElement, Tooltip, type ChartConfiguration, type ChartType,
} from "chart.js";
import { useStore } from "../lib/store";

Chart.register(BarController, BarElement, LineController, LineElement, PointElement, DoughnutController, ArcElement,
  CategoryScale, LinearScale, Tooltip, Legend, Filler);

export function themeColors(theme: "light" | "dark") {
  return theme === "dark"
    ? { accent: "#8b93ff", accentSoft: "rgba(139,147,255,0.18)", grid: "#2a2f3a", text: "#a4abb8", high: "#f07a7a", medium: "#e3b155", low: "#5fc3a0", muted: "#3a404c" }
    : { accent: "#5b5bd6", accentSoft: "rgba(91,91,214,0.12)", grid: "#eceef2", text: "#5d6472", high: "#d9484f", medium: "#c98a1c", low: "#2f9e78", muted: "#e3e6ec" };
}

/** Chart.js canvas that updates in place when its config changes. */
export function ChartCanvas<T extends ChartType>({ config, label, height = 240 }: { config: ChartConfiguration<T>; label: string; height?: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const chart = useRef<Chart<T> | null>(null);
  const { data } = useStore();
  const c = themeColors(data.settings.theme);

  useEffect(() => {
    if (!canvas.current) return;
    Chart.defaults.font.family = "'Inter Variable', system-ui, sans-serif";
    Chart.defaults.font.size = 12;
    Chart.defaults.color = c.text;
    chart.current = new Chart(canvas.current, config);
    return () => {
      chart.current?.destroy();
      chart.current = null;
    };
    // The chart is rebuilt only when its type or the theme changes; data changes update in place below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.type, data.settings.theme]);

  useEffect(() => {
    const ch = chart.current;
    if (!ch) return;
    ch.data = config.data;
    if (config.options) ch.options = config.options;
    ch.update();
  }, [config]);

  return (
    <div className="chart-box" style={{ height }}>
      <canvas ref={canvas} role="img" aria-label={label} />
    </div>
  );
}

export function baseScales(theme: "light" | "dark", opts: { max?: number; stepSize?: number } = {}) {
  const c = themeColors(theme);
  return {
    x: { grid: { display: false }, border: { display: false }, ticks: { color: c.text } },
    y: { beginAtZero: true, max: opts.max, grid: { color: c.grid }, border: { display: false }, ticks: { color: c.text, precision: 0, stepSize: opts.stepSize } },
  };
}
