import * as React from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, Search, X } from "lucide-react";
import { useCourse } from "../context/CourseContext";
import { Logo } from "./Logo";
import { Avatar } from "./Avatar";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Curriculum", path: "/courses" },
  { label: "Playground", path: "/playground" },
  { label: "Cheatsheets", path: "/resources" },
  { label: "Quizzes", path: "/quizzes" },
  { label: "Certificates", path: "/certificates" },
];

export const Navbar = () => {
  const { currentUser, switchUserRole, totalCompletedCount, overallPercent } = useCourse();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [accountOpen, setAccountOpen] = React.useState(false);
  const accountRef = React.useRef<HTMLDivElement>(null);
  const isAdmin = currentUser.role === "admin";
  const otherRole = isAdmin ? "student" : "admin";

  React.useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  React.useEffect(() => {
    if (!accountOpen) return;
    const onDown = (event: MouseEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) setAccountOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAccountOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [accountOpen]);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex h-10 items-center whitespace-nowrap rounded-md px-3 text-sm font-medium transition-colors ${
      isActive ? "bg-accent/15 text-accent" : "text-ink-2 hover:text-ink"
    }`;

  return (
    <header className="no-print sticky top-0 z-50 border-b border-line bg-page">
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <Link to="/" aria-label="IT Beginner home" className="flex-none">
          <Logo />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 xl:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.path} to={item.path} className={navClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex flex-none items-center gap-1">
          <button type="button" onClick={() => navigate("/search")} className="icon-btn" aria-label="Search lessons">
            <Search className="h-5 w-5" strokeWidth={1.75} />
          </button>
          <div className="relative" ref={accountRef}>
            <button
              type="button"
              onClick={() => setAccountOpen(!accountOpen)}
              className="icon-btn"
              aria-label="Account menu"
              aria-haspopup="menu"
              aria-expanded={accountOpen}
            >
              <Avatar name={currentUser.fullName} />
            </button>
            {accountOpen && (
              <div role="menu" className="surface absolute right-0 mt-2 w-72 p-4 text-sm shadow-xl shadow-black/40">
                <p className="font-semibold text-ink">{currentUser.fullName}</p>
                <p className="meta">{currentUser.email}</p>
                <div className="mt-4 flex items-baseline justify-between">
                  <span className="text-ink-2">Curriculum progress</span>
                  <span className="font-semibold text-ink">{overallPercent}%</span>
                </div>
                <div className="progress mt-2">
                  <span style={{ width: `${overallPercent}%` }} />
                </div>
                <p className="meta mt-2">{totalCompletedCount} of 42 lessons completed</p>
                <div className="mt-4 flex flex-col border-t border-line pt-2">
                  <Link role="menuitem" to="/profile" className="row-link -mx-2 rounded-md px-2 py-2 text-ink-2 hover:text-ink">
                    Profile
                  </Link>
                  {isAdmin && (
                    <Link role="menuitem" to="/admin" className="row-link -mx-2 rounded-md px-2 py-2 text-ink-2 hover:text-ink">
                      Admin control center
                    </Link>
                  )}
                  <button
                    role="menuitem"
                    type="button"
                    onClick={() => {
                      switchUserRole(otherRole);
                      setAccountOpen(false);
                    }}
                    title="Toggle between Student and Administrator accounts to test admin features"
                    className="row-link -mx-2 rounded-md px-2 py-2 text-left text-ink-2 hover:text-ink"
                  >
                    Switch to {otherRole} view
                  </button>
                </div>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="icon-btn xl:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" strokeWidth={1.75} /> : <Menu className="h-5 w-5" strokeWidth={1.75} />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav aria-label="Main" className="border-t border-line bg-page xl:hidden">
          <div className="container-page rows py-2">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `block py-3 text-base ${isActive ? "text-accent" : "text-ink-2"}`}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
};
