import * as React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Award,
  BookOpen,
  CircleCheck,
  CircleQuestionMark,
  CodeXml,
  Flame,
  GraduationCap,
  Laptop,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
  X,
} from "lucide-react";
import { useCourse } from "../context/CourseContext";

export const Navbar = () => {
  const { currentUser, switchUserRole, totalCompletedCount, overallPercent } = useCourse();
  const p = useLocation();
  const h = useNavigate();
  const [v, T] = React.useState(false);
  const [S, M] = React.useState(false);
  const b = (_) => !!((_ === "/" && p.pathname === "/") || (_ !== "/" && p.pathname.startsWith(_)));
  const x = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: Sparkles,
    },
    {
      label: "Curriculum",
      path: "/courses",
      icon: BookOpen,
    },
    {
      label: "Playground",
      path: "/playground",
      icon: CodeXml,
    },
    {
      label: "Cheatsheets",
      path: "/resources",
      icon: Laptop,
    },
    {
      label: "Quizzes",
      path: "/quizzes",
      icon: CircleQuestionMark,
    },
    {
      label: "Certificates",
      path: "/certificates",
      icon: Award,
    },
  ];
  return (
    <header className="sticky top-0 z-50 bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-sky-400 transition-colors">
                  IT Beginner
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  LMS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">AjinLab Platform</p>
            </div>
          </Link>
          <button
            onClick={() => h("/search")}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 bg-slate-850 hover:bg-slate-800 border border-slate-750 hover:border-slate-700 rounded-lg transition-colors w-48 text-left group"
          >
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-400 transition-colors" />
            <span className="flex-1 truncate">Search 42 lessons...</span>
            <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
              /
            </kbd>
          </button>
        </div>
        <nav className="hidden lg:flex items-center gap-1">
          {x.map((_) => {
            const R = _.icon;
            const U = b(_.path);
            return (
              <Link
                key={_.path}
                to={_.path}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${U ? "text-sky-400 bg-sky-500/10 border border-sky-500/20 shadow-sm" : "text-slate-300 hover:text-white hover:bg-slate-800/70"}`}
              >
                <R className={`w-3.5 h-3.5 ${U ? "text-sky-400" : "text-slate-400"}`} />
                {_.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2.5">
          <div
            title="5-day study streak! Keep watching and coding daily to maintain momentum."
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold shadow-sm"
          >
            <Flame className="w-4 h-4 fill-amber-400 animate-pulse text-amber-400" />
            <span>5d Streak</span>
          </div>
          <button
            onClick={() => switchUserRole(currentUser.role === "admin" ? "student" : "admin")}
            title="Toggle between Student and Administrator accounts to test admin features"
            className={`hidden sm:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border transition-all ${currentUser.role === "admin" ? "bg-purple-950/60 border-purple-500/40 text-purple-300 hover:bg-purple-900/60" : "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700"}`}
          >
            {currentUser.role === "admin" ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>Admin View</span>
              </>
            ) : (
              <>
                <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                <span>Student View</span>
              </>
            )}
            <span className="text-[10px] text-slate-400">(Switch)</span>
          </button>
          <div className="relative">
            <button
              onClick={() => M(!S)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700"
            >
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.fullName}
                className="w-8 h-8 rounded-full object-cover border border-sky-400/40"
              />
              <div className="hidden xl:block text-left text-xs">
                <p className="font-semibold text-slate-200 leading-tight">{currentUser.fullName}</p>
                <p className="text-[11px] text-sky-400 capitalize">{currentUser.role}</p>
              </div>
            </button>
            {S && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-3 z-50 text-xs animate-in fade-in duration-150"
                onClick={() => M(false)}
              >
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className="w-10 h-10 rounded-full object-cover border border-sky-500/50"
                  />
                  <div>
                    <p className="font-bold text-slate-100">{currentUser.fullName}</p>
                    <p className="text-[11px] text-slate-400">{currentUser.email}</p>
                    <span className="inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-sky-400 border border-slate-700 uppercase">
                      {currentUser.role}
                    </span>
                  </div>
                </div>
                <div className="py-2.5 space-y-1.5 border-b border-slate-800">
                  <div className="flex justify-between text-slate-400">
                    <span>Curriculum Progress:</span>
                    <span className="font-bold text-sky-400">{overallPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-sky-500 to-indigo-500 h-1.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${overallPercent}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>{totalCompletedCount} / 42 Lessons Completed</span>
                  </div>
                </div>
                <div className="pt-2 space-y-1">
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    {"Learning Hub & Dashboard"}
                  </Link>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 transition-colors"
                  >
                    <CircleCheck className="w-3.5 h-3.5 text-emerald-400" />
                    {"Profile & Credentials"}
                  </Link>
                  {currentUser.role === "admin" && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-purple-950/50 text-purple-300 font-semibold transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                      Admin Control Center
                    </Link>
                  )}
                  <button
                    onClick={() => switchUserRole(currentUser.role === "admin" ? "student" : "admin")}
                    className="w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <span>Switch to {currentUser.role === "admin" ? "Student" : "Admin"} Mode</span>
                    <span className="text-[10px] text-sky-400 font-mono">Toggle</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => T(!v)}
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            {v ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {v && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-900/98 px-4 py-3 space-y-2">
          <button
            onClick={() => {
              T(false);
              h("/search");
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
          >
            <Search className="w-4 h-4 text-sky-400" />
            <span>Search 42 lessons...</span>
          </button>
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {x.map((_) => {
              const R = _.icon;
              return (
                <Link
                  key={_.path}
                  to={_.path}
                  onClick={() => T(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-200 text-xs font-semibold"
                >
                  <R className="w-4 h-4 text-sky-400" />
                  {_.label}
                </Link>
              );
            })}
          </div>
          {currentUser.role === "admin" && (
            <Link
              to="/admin"
              onClick={() => T(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-950/60 border border-purple-800 text-purple-200 text-xs font-bold"
            >
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              Admin Control Center
            </Link>
          )}
          <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
            <span>
              Role: <strong className="text-white capitalize">{currentUser.role}</strong>
            </span>
            <button
              onClick={() => switchUserRole(currentUser.role === "admin" ? "student" : "admin")}
              className="text-sky-400 font-semibold"
            >
              Switch to {currentUser.role === "admin" ? "Student" : "Admin"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
