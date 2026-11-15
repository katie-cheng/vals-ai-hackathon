import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Bookmark, Clock, Search } from "lucide-react";
import { CHAPTERS } from "../data/chapters";
import { LESSONS } from "../data/lessons";
import { useCourse } from "../context/CourseContext";

export const SearchPage = () => {
  const { progress, bookmarks, toggleBookmark } = useCourse();
  const [i, p] = React.useState("");
  const [h, v] = React.useState<string | number>("all");
  const [T, S] = React.useState("all");
  const M = React.useMemo(
    () =>
      LESSONS.filter((lesson) => {
        if (i.trim()) {
          const x = i.toLowerCase();
          const _ = lesson.title.toLowerCase().includes(x);
          const R = lesson.description.toLowerCase().includes(x);
          const U = lesson.learningObjectives.some((learningObjective) =>
            learningObjective.toLowerCase().includes(x),
          );
          if (!_ && !R && !U) {
            return false;
          }
        }
        return !(
          (h !== "all" && lesson.chapterId !== h) ||
          (T === "completed" && progress[lesson.id]?.status !== "completed") ||
          (T === "in_progress" && progress[lesson.id]?.status !== "in_progress") ||
          (T === "bookmarked" && !bookmarks.includes(lesson.id))
        );
      }),
    [i, h, T, progress, bookmarks],
  );
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="pb-4 border-b border-slate-800 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Course Search</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
            Multi-Criteria Filter
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{"Search Curriculum & Lectures"}</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Instantly filter all 42 lessons by keyword, chapter, and learning progress status.
        </p>
      </div>
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={i}
          onChange={(event) => p(event.target.value)}
          placeholder="Search by lesson title, concepts (e.g., Vue, flexbox, npm, array, jira)..."
          className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500 placeholder-slate-400 shadow-xl"
          autoFocus
        />
        {i && (
          <button
            onClick={() => p("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 font-semibold mr-1">Chapter:</span>
          <button
            onClick={() => v("all")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${h === "all" ? "bg-sky-500 text-slate-950 font-bold" : "bg-slate-900 text-slate-300 hover:text-white border border-slate-800"}`}
          >
            All (6)
          </button>
          {CHAPTERS.map((chapter) => (
            <button
              key={chapter.id}
              onClick={() => v(chapter.id)}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 ${h === chapter.id ? "bg-sky-500 text-slate-950 font-bold" : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"}`}
            >
              <span>{chapter.icon}</span>
              <span>Ch {chapter.orderIndex}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-semibold mr-1">Status:</span>
          <select
            value={T}
            onChange={(event) => S(event.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="all">All Lessons</option>
            <option value="completed">Completed Only</option>
            <option value="in_progress">In Progress</option>
            <option value="bookmarked">Bookmarked</option>
          </select>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          Found <strong className="text-white">{M.length}</strong> matching lectures
        </span>
        {(i || h !== "all" || T !== "all") && (
          <button
            onClick={() => {
              p("");
              v("all");
              S("all");
            }}
            className="text-sky-400 hover:underline"
          >
            Reset Filters
          </button>
        )}
      </div>
      {M.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <p className="text-base font-bold text-white">No lessons match your search criteria</p>
          <p className="text-xs text-slate-400">
            Try adjusting your search query or selecting "All Chapters".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {M.map((b) => {
            const x = CHAPTERS.find((chapter) => chapter.id === b.chapterId);
            const _ = progress[b.id]?.status === "completed";
            const R = progress[b.id]?.status === "in_progress";
            const U = bookmarks.includes(b.id);
            return (
              <div
                key={b.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{x?.icon}</span>
                    <span className="text-[11px] font-bold text-sky-400">
                      Ch {x?.orderIndex} • Lesson {b.orderIndex}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {_ && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        Completed
                      </span>
                    )}
                    {R && (
                      <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded">
                        In Progress
                      </span>
                    )}
                    <button
                      onClick={() => toggleBookmark(b.id)}
                      className={`p-1 rounded hover:bg-slate-800 ${U ? "text-amber-400" : "text-slate-400"}`}
                      title={U ? "Remove bookmark" : "Bookmark lesson"}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${U ? "fill-amber-400" : ""}`} />
                    </button>
                  </div>
                </div>
                <Link
                  to={`/lesson/${b.id}`}
                  className="font-bold text-sm text-white hover:text-sky-400 transition-colors block"
                >
                  {b.title}
                </Link>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{b.description}</p>
                <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-800">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{b.durationMinutes} min</span>
                  </span>
                  <Link
                    to={`/lesson/${b.id}`}
                    className="font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1"
                  >
                    <span>Watch Lesson</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
