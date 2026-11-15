import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import { CHAPTERS } from "../data/chapters";
import { LESSONS } from "../data/lessons";
import { useCourse } from "../context/CourseContext";

const formatTimestamp = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

export const DashboardPage = () => {
  const {
    currentUser,
    progress,
    bookmarks,
    notes,
    certificates,
    lastResumeLessonId,
    totalCompletedCount,
    overallPercent,
    getChapterProgressPercent,
  } = useCourse();
  const resumeLesson = LESSONS.find((lesson) => lesson.id === lastResumeLessonId) || LESSONS[0];
  const resumeChapter = CHAPTERS.find((chapter) => chapter.id === resumeLesson.chapterId);
  const bookmarked = LESSONS.filter((lesson) => bookmarks.includes(lesson.id));
  const inProgress = Object.values(progress).filter((entry: any) => entry.status === "in_progress").length;

  return (
    <div className="container-page page">
      <h1 className="page-title">Welcome back, {currentUser.fullName}</h1>
      <p className="lead mt-2">
        You have completed{" "}
        <strong className="font-semibold text-ok">
          {totalCompletedCount} of 42 lessons ({overallPercent}%)
        </strong>
        , with <strong className="font-semibold text-accent">{inProgress} in progress</strong>, a{" "}
        <strong className="font-semibold text-quiz">{currentUser.streakDays}-day study streak</strong> and{" "}
        <strong className="font-semibold text-admin">
          {certificates.length} {certificates.length === 1 ? "certificate" : "certificates"}
        </strong>{" "}
        earned.
      </p>
      <div className="progress progress-done mt-5 max-w-[44rem]" role="img" aria-label={`${overallPercent}% of the curriculum completed`}>
        <span style={{ width: `${overallPercent}%` }} />
      </div>

      <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-8">
          <section className="surface p-6" aria-labelledby="resume-title">
            <p className="meta">
              Continue with lesson {resumeLesson.id} of 42{resumeChapter ? `, ${resumeChapter.title}` : ""}
            </p>
            <h2 id="resume-title" className="section-title mt-1">
              {resumeLesson.title}
            </h2>
            <p className="mt-2 line-clamp-2 text-sm text-ink-2">{resumeLesson.description}</p>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link to={`/lesson/${resumeLesson.id}`} className="btn btn-primary">
                <Play aria-hidden="true" />
                Resume lesson
              </Link>
              <span className="meta">{resumeLesson.durationMinutes} min</span>
            </div>
          </section>

          <section className="mt-12" aria-labelledby="chapters-title">
            <div className="flex items-baseline justify-between gap-4">
              <h2 id="chapters-title" className="section-title">
                Chapters
              </h2>
              <Link to="/courses" className="link text-sm">
                Full curriculum
              </Link>
            </div>
            <ul className="rows mt-4">
              {CHAPTERS.map((chapter) => {
                const percent = getChapterProgressPercent(chapter.id);
                const count = LESSONS.filter((lesson) => lesson.chapterId === chapter.id).length;
                return (
                  <li key={chapter.id} className="grid grid-cols-1 gap-x-6 gap-y-2 py-4 sm:grid-cols-[minmax(0,1fr)_9rem_auto] sm:items-center">
                    <div className="min-w-0">
                      <h3 className="item-title">{chapter.title}</h3>
                      <p className="meta">
                        Chapter {chapter.orderIndex}, {count} {count === 1 ? "lesson" : "lessons"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`progress flex-1 ${percent === 100 ? "progress-done" : ""}`}>
                        <span style={{ width: `${percent}%` }} />
                      </div>
                      <span className="meta w-10 text-right tabular-nums">{percent}%</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <Link to={`/courses#chapter-${chapter.id}`} className="link">
                        Lessons
                      </Link>
                      <Link to={`/quiz/${chapter.id}`} className="link link-quiz">
                        Quiz
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <aside className="space-y-10 lg:col-span-4 lg:pl-4">
          <section aria-labelledby="bookmarks-title">
            <h2 id="bookmarks-title" className="section-title">
              Bookmarked lessons
            </h2>
            {bookmarked.length === 0 ? (
              <p className="mt-3 text-sm text-ink-3">
                No bookmarks yet. Use the bookmark button in any lesson to save it here.
              </p>
            ) : (
              <ul className="rows mt-3">
                {bookmarked.map((lesson) => (
                  <li key={lesson.id}>
                    <Link to={`/lesson/${lesson.id}`} className="row-link block py-3">
                      <span className="block truncate text-sm font-medium text-ink">{lesson.title}</span>
                      <span className="meta">Lesson {lesson.orderIndex}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="notes-title">
            <h2 id="notes-title" className="section-title">
              Recent notes
            </h2>
            {notes.length === 0 ? (
              <p className="mt-3 text-sm text-ink-3">
                Take timestamped notes in any lesson to jump back to key explanations.
              </p>
            ) : (
              <ul className="rows mt-3">
                {notes.slice(0, 3).map((note) => (
                  <li key={note.id} className="py-3">
                    <p className="line-clamp-2 text-sm text-ink-2">{note.content}</p>
                    <p className="meta mt-1">
                      <Link to={`/lesson/${note.lessonId}`} className="link">
                        Lesson {note.lessonId} at {formatTimestamp(note.timestampSeconds)}
                      </Link>
                      , {note.createdAt}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="cheatsheets-title">
            <h2 id="cheatsheets-title" className="section-title">
              Cheatsheets
            </h2>
            <p className="mt-3 text-sm text-ink-3">
              Need a quick refresher on JavaScript array methods, Flexbox centering, or Git commands?
            </p>
            <Link to="/resources" className="link mt-2 inline-block text-sm">
              Browse the cheatsheets
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
};
