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
const Ctx = createContext<{ path: string; search: string; navigate(to: string): void }>({ path: "/", search: "", navigate: () => {} });

export function Router({ children }: { children: ReactNode }) {
  const [loc, setLoc] = useState(() => ({ path: normalize(location.pathname), search: location.search }));
  useEffect(() => {
    const onPop = () => setLoc({ path: normalize(location.pathname), search: location.search });
    addEventListener("popstate", onPop);
    return () => removeEventListener("popstate", onPop);
  }, []);
  const navigate = (to: string) => {
    const url = new URL(to, location.href);
    const next = { path: normalize(url.pathname), search: url.search };
    if (next.path !== loc.path || next.search !== loc.search) history.pushState(null, "", url.pathname + url.search);
    setLoc(next);
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
