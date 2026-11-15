import * as React from "react";
import { Link } from "react-router-dom";
import { Bookmark, Search } from "lucide-react";
import { CHAPTERS } from "../data/chapters";
import { LESSONS } from "../data/lessons";
import { useCourse } from "../context/CourseContext";

const STATUS_LABEL: Record<string, string> = { completed: "Completed", in_progress: "In progress" };

export const SearchPage = () => {
  const { progress, bookmarks, toggleBookmark } = useCourse();
  const [query, setQuery] = React.useState("");
  const [chapterFilter, setChapterFilter] = React.useState<string | number>("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const results = React.useMemo(
    () =>
      LESSONS.filter((lesson) => {
        const q = query.trim().toLowerCase();
        if (
          q &&
          !lesson.title.toLowerCase().includes(q) &&
          !lesson.description.toLowerCase().includes(q) &&
          !lesson.learningObjectives.some((objective) => objective.toLowerCase().includes(q))
        ) {
          return false;
        }
        return !(
          (chapterFilter !== "all" && lesson.chapterId !== chapterFilter) ||
          (statusFilter === "completed" && progress[lesson.id]?.status !== "completed") ||
          (statusFilter === "in_progress" && progress[lesson.id]?.status !== "in_progress") ||
          (statusFilter === "bookmarked" && !bookmarks.includes(lesson.id))
        );
      }),
    [query, chapterFilter, statusFilter, progress, bookmarks],
  );
  const filtered = query !== "" || chapterFilter !== "all" || statusFilter !== "all";
  const reset = () => {
    setQuery("");
    setChapterFilter("all");
    setStatusFilter("all");
  };

  return (
    <div className="container-page page">
      <h1 className="page-title">Search lessons</h1>
      <p className="lead mt-2">Filter all 42 lessons by keyword, chapter and progress.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-12">
        <div className="sm:col-span-6">
          <label htmlFor="search-query" className="field-label">
            Keyword
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" strokeWidth={1.75} aria-hidden="true" />
            <input
              id="search-query"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Vue, flexbox, npm, array, jira"
              className="field pl-9"
              autoFocus
            />
          </div>
        </div>
        <div className="sm:col-span-3">
          <label htmlFor="search-chapter" className="field-label">
            Chapter
          </label>
          <select
            id="search-chapter"
            value={String(chapterFilter)}
            onChange={(event) => setChapterFilter(event.target.value === "all" ? "all" : Number(event.target.value))}
            className="field"
          >
            <option value="all">All chapters</option>
            {CHAPTERS.map((chapter) => (
              <option key={chapter.id} value={chapter.id}>
                {chapter.orderIndex}. {chapter.title}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-3">
          <label htmlFor="search-status" className="field-label">
            Status
          </label>
          <select id="search-status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="field">
            <option value="all">All lessons</option>
            <option value="completed">Completed</option>
            <option value="in_progress">In progress</option>
            <option value="bookmarked">Bookmarked</option>
          </select>
        </div>
      </div>

      <div className="mt-8 flex min-h-8 items-center justify-between gap-4">
        <p className="meta" role="status">
          {results.length} {results.length === 1 ? "lesson" : "lessons"} found
        </p>
        {filtered && (
          <button type="button" onClick={reset} className="link text-sm">
            Reset filters
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <div className="border-y border-line py-12">
          <p className="item-title">No lessons match your search</p>
          <p className="mt-1 text-sm text-ink-3">Try a different keyword or choose all chapters.</p>
        </div>
      ) : (
        <ul className="rows mt-2">
          {results.map((lesson) => {
            const chapter = CHAPTERS.find((item) => item.id === lesson.chapterId);
            const status = progress[lesson.id]?.status;
            const isBookmarked = bookmarks.includes(lesson.id);
            return (
              <li key={lesson.id} className="flex items-start gap-3">
                <Link to={`/lesson/${lesson.id}`} className="row-link grid min-w-0 flex-1 grid-cols-1 gap-x-8 gap-y-1 py-4 lg:grid-cols-12">
                  <span className="min-w-0 lg:col-span-4">
                    <span className="item-title block">{lesson.title}</span>
                    <span className="meta">
                      Chapter {chapter?.orderIndex}, lesson {lesson.orderIndex}, {lesson.durationMinutes} min
                      {status && STATUS_LABEL[status] && (
                        <span className={status === "completed" ? "text-ok" : "text-accent"}>, {STATUS_LABEL[status].toLowerCase()}</span>
                      )}
                    </span>
                  </span>
                  <span className="line-clamp-2 text-sm text-ink-3 lg:col-span-8">{lesson.description}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => toggleBookmark(lesson.id)}
                  aria-pressed={isBookmarked}
                  aria-label={isBookmarked ? `Remove bookmark: ${lesson.title}` : `Bookmark: ${lesson.title}`}
                  className={`icon-btn mt-2 ${isBookmarked ? "text-warn hover:text-warn" : ""}`}
                >
                  <Bookmark className="h-[1.125rem] w-[1.125rem]" strokeWidth={1.75} fill={isBookmarked ? "currentColor" : "none"} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
