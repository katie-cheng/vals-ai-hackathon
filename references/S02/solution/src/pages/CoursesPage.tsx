import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { Bookmark, Check } from "lucide-react";
import { CHAPTERS } from "../data/chapters";
import { LESSONS } from "../data/lessons";
import { useCourse } from "../context/CourseContext";

export const CoursesPage = () => {
  const { progress, bookmarks, toggleBookmark, getChapterProgressPercent } = useCourse();
  const [filter, setFilter] = React.useState<string | number>("all");
  const { hash } = useLocation();
  const chapters = filter === "all" ? CHAPTERS : CHAPTERS.filter((chapter) => chapter.id === filter);

  React.useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);

  return (
    <div className="container-page page">
      <h1 className="page-title">Full-stack course curriculum</h1>
      <p className="lead mt-2">
        Six chapters and 42 lessons, taken in order. Watch the lectures, run code in the sandbox, take the chapter
        quiz and claim your certificate.
      </p>

      <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filter by chapter">
        <button type="button" onClick={() => setFilter("all")} aria-pressed={filter === "all"} className="option">
          All chapters
        </button>
        {CHAPTERS.map((chapter) => (
          <button
            key={chapter.id}
            type="button"
            onClick={() => setFilter(chapter.id)}
            aria-pressed={filter === chapter.id}
            className="option"
            title={chapter.title}
          >
            Chapter {chapter.orderIndex}
          </button>
        ))}
      </div>

      <div className="mt-10 space-y-16">
        {chapters.map((chapter) => {
          const lessons = LESSONS.filter((lesson) => lesson.chapterId === chapter.id);
          const percent = getChapterProgressPercent(chapter.id);
          const completed = lessons.filter((lesson) => progress[lesson.id]?.status === "completed").length;
          const done = percent === 100;
          return (
            <section
              key={chapter.id}
              id={`chapter-${chapter.id}`}
              aria-labelledby={`chapter-${chapter.id}-title`}
              className="grid scroll-mt-24 grid-cols-1 gap-8 lg:grid-cols-12"
            >
              <div className="lg:col-span-4">
                <div className="lg:sticky lg:top-24">
                  <h2 id={`chapter-${chapter.id}-title`} className="section-title">
                    {chapter.title}
                  </h2>
                  <p className="meta mt-1">
                    Chapter {chapter.orderIndex}, {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"},{" "}
                    {chapter.estimatedHours}
                  </p>
                  <p className="mt-3 text-sm text-ink-2">{chapter.description}</p>
                  <p className="meta mt-2">Covers {chapter.keyConcepts.join(", ").toLowerCase()}.</p>
                  <div className="mt-5 flex items-center gap-3">
                    <div className={`progress flex-1 ${done ? "progress-done" : ""}`}>
                      <span style={{ width: `${percent}%` }} />
                    </div>
                    <span className="meta flex-none tabular-nums">
                      {completed} of {lessons.length} completed
                    </span>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
                    <Link to={`/quiz/${chapter.id}`} className="btn btn-secondary">
                      Chapter quiz
                    </Link>
                    {done && (
                      <Link to={`/certificate/ITB-CH${chapter.id}-CRED`} className="link text-sm">
                        Certificate
                      </Link>
                    )}
                  </div>
                </div>
              </div>
              <ol className="rows lg:col-span-8">
                {lessons.map((lesson) => {
                  const status = progress[lesson.id]?.status;
                  const isBookmarked = bookmarks.includes(lesson.id);
                  return (
                    <li key={lesson.id} className="flex items-center gap-3">
                      <Link to={`/lesson/${lesson.id}`} className="row-link flex min-w-0 flex-1 items-baseline gap-4 py-3">
                        <span className="meta w-6 flex-none text-right tabular-nums">{lesson.orderIndex}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[0.9375rem] text-ink">{lesson.title}</span>
                          <span className="meta">
                            {lesson.durationMinutes} min
                            {status === "in_progress" && <span className="text-accent">, in progress</span>}
                          </span>
                        </span>
                        {status === "completed" && (
                          <span className="flex flex-none items-center gap-1 self-center text-[0.8125rem] text-ok">
                            <Check className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                            Completed
                          </span>
                        )}
                      </Link>
                      <button
                        type="button"
                        onClick={() => toggleBookmark(lesson.id)}
                        aria-pressed={isBookmarked}
                        aria-label={isBookmarked ? `Remove bookmark: ${lesson.title}` : `Bookmark: ${lesson.title}`}
                        className={`icon-btn ${isBookmarked ? "text-warn hover:text-warn" : ""}`}
                      >
                        <Bookmark className="h-[1.125rem] w-[1.125rem]" strokeWidth={1.75} fill={isBookmarked ? "currentColor" : "none"} />
                      </button>
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>
    </div>
  );
};
