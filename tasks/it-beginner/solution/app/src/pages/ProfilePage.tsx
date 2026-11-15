import * as React from "react";
import { Download, RotateCcw } from "lucide-react";
import { Avatar } from "../components/Avatar";
import { Link } from "react-router-dom";
import { useCourse } from "../context/CourseContext";
import { useAuth } from "../context/AuthContext";

export const ProfilePage = () => {
  const { account, signOut } = useAuth();
  const { currentUser, totalCompletedCount, overallPercent, certificates, notes, resetAllProgress } =
    useCourse();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [resetDone, setResetDone] = React.useState(false);
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (!confirmOpen) return;
    cancelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setConfirmOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [confirmOpen]);

  const reset = () => {
    resetAllProgress();
    setConfirmOpen(false);
    setResetDone(true);
  };

  const exportData = () => {
    const payload = {
      user: currentUser,
      progressCompletedCount: totalCompletedCount,
      certificates,
      notes,
      exportDate: new Date().toISOString(),
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `it-beginner-learning-export-${currentUser.username}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container-page page">
      <div className="max-w-3xl">
        <h1 className="page-title">Profile</h1>

        <section className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar name={currentUser.fullName} size="lg" />
          <div className="min-w-0 flex-1">
            <h2 className="section-title">{currentUser.fullName}</h2>
            {account ? (
              <>
                <p className="meta break-all">{account.email}</p>
                <p className="meta">
                  {account.role === "admin" ? "Admin" : "Student"}, joined {account.joinedDate}
                </p>
              </>
            ) : (
              <p className="meta">Not signed in. Your progress is saved in this browser.</p>
            )}
          </div>
          {account ? (
            <button type="button" onClick={signOut} className="btn btn-secondary self-start sm:self-auto">
              Sign out
            </button>
          ) : (
            <Link to="/login?next=/profile" className="btn btn-secondary self-start sm:self-auto">
              Sign in
            </Link>
          )}
        </section>

        <dl className="rows mt-10 text-sm">
          {[
            ["Lessons completed", `${totalCompletedCount} of 42 (${overallPercent}%)`, "text-ok"],
            ["Certificates earned", String(certificates.length), "text-admin"],
            ["Personal notes", String(notes.length), "text-accent"],
          ].map(([label, value, colour]) => (
            <div key={label} className="flex items-baseline justify-between gap-4 py-3">
              <dt className="text-ink-3">{label}</dt>
              <dd className={`font-semibold tabular-nums ${colour}`}>{value}</dd>
            </div>
          ))}
        </dl>

        <section className="mt-12" aria-labelledby="data-title">
          <h2 id="data-title" className="section-title">
            Your data
          </h2>
          <p className="mt-2 text-sm text-ink-3">
            Export your learning milestones, saved code snippets, and timestamped notes to JSON, or reset all course
            progress.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button type="button" onClick={exportData} className="btn btn-secondary">
              <Download aria-hidden="true" />
              Export learning data
            </button>
            <button type="button" onClick={() => setConfirmOpen(true)} className="btn btn-secondary text-bad">
              <RotateCcw aria-hidden="true" />
              Reset all progress
            </button>
          </div>
          <p role="status" className="mt-4 min-h-6 text-sm text-ok">
            {resetDone && <span className="fade-in">All progress and notes have been reset.</span>}
          </p>
        </section>
      </div>

      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) setConfirmOpen(false);
          }}
        >
          <div role="alertdialog" aria-modal="true" aria-labelledby="reset-title" aria-describedby="reset-body" className="surface fade-in w-full max-w-sm p-6">
            <h2 id="reset-title" className="section-title">
              Reset course progress?
            </h2>
            <p id="reset-body" className="mt-2 text-sm text-ink-2">
              This will clear all completed lesson checkmarks, personal notes, and certificates from your browser
              storage.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
              <button ref={cancelRef} type="button" onClick={() => setConfirmOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={reset} className="btn btn-secondary border-bad text-bad">
                Reset progress
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
