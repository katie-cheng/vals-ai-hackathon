import { CalendarClock, Moon, Sun } from "lucide-react";
import { Button } from "./ui";

type Props = { dark: boolean; onTheme: () => void; onSettings: () => void };

export default function Header({ dark, onTheme, onSettings }: Props) {
  return (
    <header className="glass sticky top-0 z-30 border-x-0 border-t-0">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <a href="/" className="flex items-center gap-2.5 text-slate-900 dark:text-white" aria-label="Preboards Hub home">
          <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden="true">
            <rect width="32" height="32" rx="8" className="fill-slate-900 dark:fill-indigo-500/20" />
            <path d="M10 8h8a5 5 0 0 1 0 10h-4v6h-4z" fill="none" stroke="#a5b4fc" strokeWidth="2.4" strokeLinejoin="round" />
          </svg>
          <span className="text-lg font-bold tracking-tight">Preboards Hub</span>
        </a>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" onClick={onSettings} aria-label="Exam date settings">
            <CalendarClock className="size-4" aria-hidden="true" />
            <span className="hidden md:inline">Exam date</span>
          </Button>
          <Button variant="secondary" onClick={onTheme} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} aria-pressed={dark}>
            {dark ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}
            <span className="hidden sm:inline">{dark ? "Light mode" : "Dark mode"}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
