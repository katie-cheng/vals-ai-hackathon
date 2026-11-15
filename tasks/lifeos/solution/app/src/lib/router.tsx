import { createContext, useContext, useEffect, useState, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from "react";

export interface Route { path: string; title: string }

export const ROUTES: Route[] = [
  { path: "/", title: "Overview" },
  { path: "/tasks", title: "My Tasks" },
  { path: "/habits", title: "Habits" },
  { path: "/calendar", title: "Calendar" },
  { path: "/focus", title: "Focus Mode" },
  { path: "/notes", title: "Notes" },
  { path: "/analytics", title: "Analytics" },
  { path: "/settings", title: "Settings" },
];

const normalize = (p: string) => (p.length > 1 ? p.replace(/\/+$/, "") : p);
const Ctx = createContext<{ path: string; search: string; visit: number; navigate(to: string): void }>({ path: "/", search: "", visit: 0, navigate: () => {} });

export function Router({ children }: { children: ReactNode }) {
  const [loc, setLoc] = useState(() => ({ path: normalize(location.pathname), search: location.search, visit: 0 }));
  useEffect(() => {
    const onPop = () => setLoc((l) => ({ path: normalize(location.pathname), search: location.search, visit: l.visit + 1 }));
    addEventListener("popstate", onPop);
    return () => removeEventListener("popstate", onPop);
  }, []);
  const navigate = (to: string) => {
    const url = new URL(to, location.href);
    if (url.pathname + url.search !== location.pathname + location.search) history.pushState(null, "", url.pathname + url.search);
    // A query link (?new=1, ?q=) is an instruction to the page, so it remounts the page even when already there.
    setLoc((l) => ({ path: normalize(url.pathname), search: url.search, visit: url.search ? l.visit + 1 : l.visit }));
    window.scrollTo({ top: 0 });
  };
  return <Ctx.Provider value={{ ...loc, navigate }}>{children}</Ctx.Provider>;
}

export const useRouter = () => useContext(Ctx);

export function Link({ to, onClick, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) {
  const { navigate } = useRouter();
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    navigate(to);
  };
  return <a href={to} onClick={handle} {...rest} />;
}
