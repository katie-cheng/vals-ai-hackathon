import * as React from "react";
import { Link } from "react-router-dom";
import { Award, Bookmark, CircleCheck, CircleQuestionMark, Clock, Play } from "lucide-react";
import { CHAPTERS } from "../data/chapters";
import { LESSONS } from "../data/lessons";
import { useCourse } from "../context/CourseContext";

export const CoursesPage = () => {
  const { progress, bookmarks, toggleBookmark, getChapterProgressPercent, isChapterCompleted } = useCourse();
  const [h, v] = React.useState<string | number>("all");
  const T = h === "all" ? CHAPTERS : CHAPTERS.filter((chapter) => chapter.id === h);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="pb-4 border-b border-slate-800 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Curriculum Catalog</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
            6 Chapters • 42 Lessons
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Full-Stack Course Curriculum</h1>
        <p className="text-sm text-slate-400 max-w-3xl">
          Progress sequentially through the 6 structured chapters. Watch lectures, run code in the live
          sandbox, test your knowledge with quizzes, and claim verified credentials.
        </p>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs scrollbar-thin">
        <button
          onClick={() => v("all")}
          className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${h === "all" ? "bg-sky-500 text-slate-950 font-bold" : "bg-slate-800 text-slate-300 hover:text-white"}`}
        >
          All Chapters (6)
        </button>
        {CHAPTERS.map((chapter) => (
          <button
            key={chapter.id}
            onClick={() => v(chapter.id)}
            className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors flex items-center gap-1.5 ${h === chapter.id ? "bg-sky-500 text-slate-950 font-bold" : "bg-slate-800 text-slate-300 hover:text-white"}`}
          >
            <span>{chapter.icon}</span>
            <span>
              Ch {chapter.orderIndex}: {chapter.title}
            </span>
          </button>
        ))}
      </div>
      <div className="space-y-8">
        {T.map((S) => {
          const M = LESSONS.filter((lesson) => lesson.chapterId === S.id);
          const b = getChapterProgressPercent(S.id);
          const x = M.filter((R) => progress[R.id]?.status === "completed").length;
          const _ = b === 100;
          return (
            <div
              key={S.id}
              id={`chapter-${S.id}`}
              className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-6 shadow-xl"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shrink-0">
                    {S.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-sky-400">Chapter {S.orderIndex}</span>
                      <span className="text-[11px] text-slate-400">• {M.length} Lessons</span>
                      <span className="text-[11px] text-slate-400">• {S.estimatedHours}</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white">{S.title}</h2>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">{S.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <div className="text-right mr-2 hidden sm:block">
                    <p className="text-xs text-slate-400">Completion</p>
                    <p className="text-sm font-bold text-white font-mono">
                      {x} / {M.length} ({b}%)
                    </p>
                  </div>
                  <Link
                    to={`/quiz/${S.id}`}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-xs transition-colors"
                  >
                    <CircleQuestionMark className="w-4 h-4 text-amber-400" />
                    <span>Chapter Quiz</span>
                  </Link>
                  {_ && (
                    <Link
                      to={`/certificate/ITB-CH${S.id}-CRED`}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs transition-colors"
                    >
                      <Award className="w-4 h-4 text-emerald-400" />
                      <span>Certificate</span>
                    </Link>
                  )}
                </div>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${_ ? "bg-emerald-400" : "bg-sky-500"}`}
                  style={{
                    width: `${b}%`,
                  }}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {M.map((R) => {
                  const U = progress[R.id];
                  const V = U?.status === "completed";
                  const k = U?.status === "in_progress";
                  const F = bookmarks.includes(R.id);
                  return (
                    <div
                      key={R.id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${V ? "bg-slate-850/90 border-emerald-500/20" : k ? "bg-slate-850/90 border-sky-500/30" : "bg-slate-850/50 border-slate-800 hover:border-slate-700"}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${V ? "bg-emerald-500/20 text-emerald-400 font-bold" : k ? "bg-sky-500/20 text-sky-400 font-bold" : "bg-slate-800 text-slate-400"}`}
                        >
                          {V ? <CircleCheck className="w-4 h-4" /> : R.orderIndex}
                        </div>
                        <div className="truncate">
                          <Link
                            to={`/lesson/${R.id}`}
                            className="font-semibold text-xs sm:text-sm text-slate-200 hover:text-sky-400 transition-colors block truncate"
                          >
                            {R.title}
                          </Link>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{R.durationMinutes} min</span>
                            {V && <span className="text-emerald-400 font-bold">• Completed</span>}
                            {k && <span className="text-sky-400 font-bold">• In Progress</span>}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => toggleBookmark(R.id)}
                          className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors ${F ? "text-amber-400" : "text-slate-400 hover:text-slate-300"}`}
                          title={F ? "Remove bookmark" : "Bookmark lesson"}
                        >
                          <Bookmark className={`w-4 h-4 ${F ? "fill-amber-400" : ""}`} />
                        </button>
                        <Link
                          to={`/lesson/${R.id}`}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-slate-300 font-bold text-xs transition-colors flex items-center gap-1"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Watch</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400 border-t border-slate-800/80">
                <span className="text-[11px] font-semibold">Key Topics:</span>
                {S.keyConcepts.map((keyConcept) => (
                  <span
                    key={keyConcept}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-750"
                  >
                    {keyConcept}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
