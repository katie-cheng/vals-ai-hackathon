import * as React from "react";
import { Download, RotateCcw } from "lucide-react";
import { useCourse } from "../context/CourseContext";

export const ProfilePage = () => {
  const {
    currentUser,
    switchUserRole,
    totalCompletedCount,
    overallPercent,
    certificates,
    notes,
    resetAllProgress,
  } = useCourse();
  const [T, S] = React.useState(false);
  const [M, b] = React.useState(false);
  const x = () => {
    resetAllProgress();
    S(false);
    b(true);
    setTimeout(() => b(false), 3e3);
  };
  const _ = () => {
    const R = {
      user: currentUser,
      progressCompletedCount: totalCompletedCount,
      certificates,
      notes,
      exportDate: new Date().toISOString(),
    };
    const U = new Blob([JSON.stringify(R, null, 2)], {
      type: "application/json",
    });
    const V = URL.createObjectURL(U);
    const k = document.createElement("a");
    k.href = V;
    k.download = `it-beginner-learning-export-${currentUser.username}.json`;
    k.click();
    URL.revokeObjectURL(V);
  };
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="pb-4 border-b border-slate-800 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
            {"Account & Credentials"}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Student Profile Settings</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Manage your personal profile, credentials showcase, and learning data.
        </p>
      </div>
      {M && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold animate-in fade-in">
          ✓ All progress and notes have been reset to fresh student defaults.
        </div>
      )}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.fullName}
            className="w-20 h-20 rounded-full object-cover border-2 border-sky-400 shadow-lg"
          />
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">{currentUser.fullName}</h2>
            <p className="text-xs text-slate-400">{currentUser.email}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-xs">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-sky-400 font-bold uppercase text-[10px]">
                {currentUser.role}
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold text-[10px]">
                🔥 {currentUser.streakDays} Day Streak
              </span>
              <span className="text-slate-400 text-[11px]">Enrolled: {currentUser.joinedDate}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => switchUserRole(currentUser.role === "admin" ? "student" : "admin")}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
        >
          Toggle to {currentUser.role === "admin" ? "Student" : "Admin"} Mode
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-center">
          <p className="text-2xl font-black text-white">{totalCompletedCount} / 42</p>
          <p className="text-xs text-slate-400">Lessons Completed</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-center">
          <p className="text-2xl font-black text-sky-400">{overallPercent}%</p>
          <p className="text-xs text-slate-400">Curriculum Mastery</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-center">
          <p className="text-2xl font-black text-amber-400">{certificates.length}</p>
          <p className="text-xs text-slate-400">Earned Certificates</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-center">
          <p className="text-2xl font-black text-purple-400">{notes.length}</p>
          <p className="text-xs text-slate-400">Personal Notes</p>
        </div>
      </div>
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="font-bold text-base text-white">{"Data & Privacy Options"}</h3>
        <p className="text-xs text-slate-400">
          Export your learning milestones, saved code snippets, and timestamped notes to JSON, or reset all
          course progress.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={_}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>Export Learning Data (.json)</span>
          </button>
          <button
            onClick={() => S(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 text-xs font-semibold border border-rose-500/30 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Progress</span>
          </button>
        </div>
      </div>
      {T && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 max-w-sm w-full space-y-4 text-xs">
            <h3 className="font-bold text-base text-white">Reset Course Progress?</h3>
            <p className="text-slate-300 leading-relaxed">
              This will clear all completed lesson checkmarks, personal notes, and certificates from your
              browser storage.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => S(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={x}
                className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-bold"
              >
                Yes, Reset Progress
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
