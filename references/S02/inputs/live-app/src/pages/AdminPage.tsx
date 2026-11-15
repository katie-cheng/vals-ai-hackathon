import * as React from "react";
import { Search, ShieldCheck } from "lucide-react";
import { useCourse } from "../context/CourseContext";

const MOCK_STUDENTS = [
  {
    id: 1,
    fullName: "Alex Chen (You)",
    email: "alex.chen@itbeginner.com",
    role: "student",
    completedLessons: 3,
    quizzesPassed: 1,
    notesCount: 2,
    joinedDate: "2026-10-18",
  },
  {
    id: 2,
    fullName: "David Miller",
    email: "david.miller@gmail.com",
    role: "student",
    completedLessons: 18,
    quizzesPassed: 3,
    notesCount: 7,
    joinedDate: "2026-10-20",
  },
  {
    id: 3,
    fullName: "Samantha Ray",
    email: "samantha.ray@techmail.io",
    role: "student",
    completedLessons: 42,
    quizzesPassed: 6,
    notesCount: 19,
    joinedDate: "2026-10-15",
  },
  {
    id: 4,
    fullName: "Kenji Sato",
    email: "kenji.sato@yahoo.co.jp",
    role: "student",
    completedLessons: 24,
    quizzesPassed: 4,
    notesCount: 11,
    joinedDate: "2026-10-22",
  },
  {
    id: 5,
    fullName: "Elena Rostova",
    email: "elena.rostova@designlab.de",
    role: "student",
    completedLessons: 31,
    quizzesPassed: 5,
    notesCount: 14,
    joinedDate: "2026-10-19",
  },
  {
    id: 99,
    fullName: "Course Admin (AjinLab)",
    email: "admin@itbeginner.com",
    role: "admin",
    completedLessons: 42,
    quizzesPassed: 6,
    notesCount: 45,
    joinedDate: "2026-10-01",
  },
];

export const AdminPage = () => {
  const { currentUser, switchUserRole } = useCourse();
  const [f, i] = React.useState(MOCK_STUDENTS);
  const [p, h] = React.useState("");
  const v = (S) => {
    i((M) =>
      M.map((b) => {
        if (b.id === S) {
          const x = b.role === "admin" ? "student" : "admin";
          return {
            ...b,
            role: x,
          };
        }
        return b;
      }),
    );
  };
  const T = f.filter(
    (S) =>
      S.fullName.toLowerCase().includes(p.toLowerCase()) || S.email.toLowerCase().includes(p.toLowerCase()),
  );
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {currentUser.role !== "admin" && (
        <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between gap-4 text-xs text-purple-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0" />
            <span>
              You are currently in <strong>Student Mode</strong>. Toggle to Admin Mode to activate
              administrator actions.
            </span>
          </div>
          <button
            onClick={() => switchUserRole("admin")}
            className="px-3 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold shrink-0 transition-colors"
          >
            Switch to Admin Mode
          </button>
        </div>
      )}
      <div className="pb-4 border-b border-slate-800 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Control Center</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
            {"System Telemetry & Student Roster"}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Administrator Control Suite</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Real-time metrics, student enrollment roster, role elevation, and course engagement tracking for the
          IT Beginner platform.
        </p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Total Students</span>
          <p className="text-2xl font-black text-white">1,480</p>
          <span className="text-[10px] text-emerald-400">+12% this week</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Lesson Completions</span>
          <p className="text-2xl font-black text-sky-400">18,420</p>
          <span className="text-[10px] text-slate-400">Across 42 lessons</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Quiz Pass Rate</span>
          <p className="text-2xl font-black text-emerald-400">89.2%</p>
          <span className="text-[10px] text-slate-400">6 Chapter Quizzes</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Certificates Issued</span>
          <p className="text-2xl font-black text-amber-400">340</p>
          <span className="text-[10px] text-slate-400">Verifiable Credentials</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">{"Community Q&A"}</span>
          <p className="text-2xl font-black text-purple-400">420</p>
          <span className="text-[10px] text-slate-400">Threaded Discussions</span>
        </div>
      </div>
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">Enrolled Student Roster</h2>
            <p className="text-xs text-slate-400">
              Manage student access, view learning progress, and elevate roles.
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={p}
              onChange={(event) => h(event.target.value)}
              placeholder="Filter by name or email..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Student Name</th>
                <th className="pb-3 font-semibold">Role</th>
                <th className="pb-3 font-semibold">Completed</th>
                <th className="pb-3 font-semibold">Quizzes</th>
                <th className="pb-3 font-semibold">Notes</th>
                <th className="pb-3 font-semibold">Joined</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {T.map((S) => (
                <tr key={S.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-3 pr-2">
                    <p className="font-bold text-white">{S.fullName}</p>
                    <p className="text-[11px] text-slate-400">{S.email}</p>
                  </td>
                  <td className="py-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${S.role === "admin" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "bg-slate-800 text-slate-300"}`}
                    >
                      {S.role}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="space-y-1">
                      <span className="font-mono font-bold text-white">{S.completedLessons} / 42</span>
                      <div className="w-20 bg-slate-800 rounded-full h-1">
                        <div
                          className="bg-sky-400 h-1 rounded-full"
                          style={{
                            width: `${Math.round((S.completedLessons / 42) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 font-mono">{S.quizzesPassed} / 6</td>
                  <td className="py-3 font-mono">{S.notesCount}</td>
                  <td className="py-3 text-slate-400">{S.joinedDate}</td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => v(S.id)}
                      className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 hover:text-white transition-colors"
                    >
                      Toggle Role
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
