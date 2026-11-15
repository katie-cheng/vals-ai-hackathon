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
const Ctx = createContext<{ path: string; navigate(to: string): void }>({ path: "/", navigate: () => {} });

export function Router({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(() => normalize(location.pathname));
  useEffect(() => {
    const onPop = () => setPath(normalize(location.pathname));
    addEventListener("popstate", onPop);
    return () => removeEventListener("popstate", onPop);
  }, []);
  const navigate = (to: string) => {
    if (normalize(to) !== path) history.pushState(null, "", to);
    setPath(normalize(to));
    window.scrollTo({ top: 0 });
  };
  return <Ctx.Provider value={{ path, navigate }}>{children}</Ctx.Provider>;
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
