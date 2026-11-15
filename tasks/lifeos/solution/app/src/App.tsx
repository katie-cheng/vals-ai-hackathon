import { StoreProvider } from "./lib/store";
import { TimerProvider } from "./lib/timer";
import { ROUTES, Router, useRouter, Link } from "./lib/router";
import { Shell } from "./components/Shell";
import { Toasts, ConfirmDialog, EmptyState } from "./components/Feedback";
import { Overview } from "./pages/Overview";
import { Tasks } from "./pages/Tasks";
import { Habits } from "./pages/Habits";
import { Calendar } from "./pages/Calendar";
import { Focus } from "./pages/Focus";
import { Notes } from "./pages/Notes";
import { Analytics } from "./pages/Analytics";
import { Settings } from "./pages/Settings";
import { Compass } from "lucide-react";

const PAGES: Record<string, () => React.ReactElement> = {
  "/": Overview, "/tasks": Tasks, "/habits": Habits, "/calendar": Calendar, "/focus": Focus, "/notes": Notes, "/analytics": Analytics, "/settings": Settings,
};

function Current() {
  const { path } = useRouter();
  const Page = PAGES[path];
  const title = ROUTES.find((r) => r.path === path)?.title ?? "Page not found";
  return (
    <Shell title={title}>
      {Page ? <Page /> : <div className="card"><EmptyState icon={<Compass size={20} />} title="This page doesn't exist" text="Head back to your overview." action={<Link to="/" className="btn btn-primary">Back to Overview</Link>} /></div>}
    </Shell>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <TimerProvider>
        <Router>
          <Current />
          <Toasts />
          <ConfirmDialog />
        </Router>
      </TimerProvider>
    </StoreProvider>
  );
}
