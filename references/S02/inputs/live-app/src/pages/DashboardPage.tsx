import { Link, useNavigate } from "react-router-dom";
import { Award, Bookmark, CircleCheck, Clock, CodeXml, FileText, Flame, Play, Sparkles } from "lucide-react";
import { CHAPTERS } from "../data/chapters";
import { LESSONS } from "../data/lessons";
import { useCourse } from "../context/CourseContext";

export const DashboardPage = () => {
  useNavigate();
  const {
    currentUser,
    progress,
    bookmarks,
    notes,
    certificates,
    quizAttempts,
    lastResumeLessonId,
    totalCompletedCount,
    overallPercent,
    getChapterProgressPercent,
  } = useCourse();
  const b = LESSONS.find((lesson) => lesson.id === lastResumeLessonId) || LESSONS[0];
  const x = LESSONS.filter((lesson) => bookmarks.includes(lesson.id));
  const _ = Object.values(progress).filter((object: any) => object.status === "in_progress").length;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Student Dashboard</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Active Learner
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome back, {currentUser.fullName}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Pick up right where you left off. You are{" "}
            <strong className="text-sky-400">{overallPercent}%</strong> through the IT Beginner curriculum.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/playground"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <CodeXml className="w-3.5 h-3.5 text-sky-400" />
            <span>Playground</span>
          </Link>
          <Link
            to="/certificates"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Certificates ({certificates.length})</span>
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Completed</span>
            <CircleCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">
            {totalCompletedCount} <span className="text-xs font-normal text-slate-400">/ 42</span>
          </p>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
            <div
              className="bg-emerald-400 h-1.5 rounded-full"
              style={{
                width: `${overallPercent}%`,
              }}
            />
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Daily Streak</span>
            <Flame className="w-4 h-4 fill-amber-400 text-amber-400 animate-pulse" />
          </div>
          <p className="text-2xl font-black text-amber-400">{currentUser.streakDays} Days</p>
          <p className="text-[11px] text-slate-400">Consistent daily study logged</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>In-Progress</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-black text-sky-400">{_}</p>
          <p className="text-[11px] text-slate-400">{"Lectures started & tracked"}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Earned Credentials</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-purple-400">{certificates.length}</p>
          <p className="text-[11px] text-slate-400">Certificates unlocked</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="rounded-2xl bg-gradient-to-r from-sky-950/70 via-slate-900 to-indigo-950/70 border border-sky-500/30 p-6 sm:p-8 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-500/20 text-sky-300 text-xs font-bold">
                <Play className="w-3.5 h-3.5 fill-sky-300" />
                Resume Your Lecture
              </span>
              <span className="text-xs text-slate-400 font-mono">Lesson #{b.id} of 42</span>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">{b.title}</h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 line-clamp-2">{b.description}</p>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span>
                  Duration: <strong className="text-white">{b.durationMinutes} min</strong>
                </span>
                <span>
                  Chapter: <strong className="text-sky-400">{b.chapterId}</strong>
                </span>
              </div>
              <Link
                to={`/lesson/${b.id}`}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 hover:scale-105 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>Jump into Lesson →</span>
              </Link>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-white">Curriculum Chapters</h3>
              <Link to="/courses" className="text-xs font-bold text-sky-400 hover:text-sky-300">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CHAPTERS.map((chapter) => {
                const U = getChapterProgressPercent(chapter.id);
                const V = LESSONS.filter((lesson) => lesson.chapterId === chapter.id);
                const k = U === 100;
                return (
                  <div
                    key={chapter.id}
                    className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{chapter.icon}</span>
                        <div>
                          <span className="text-[11px] font-bold text-sky-400">
                            Chapter {chapter.orderIndex}
                          </span>
                          <h4 className="font-bold text-sm text-white truncate max-w-[180px] sm:max-w-[210px]">
                            {chapter.title}
                          </h4>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-300 font-mono">{U}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-500 ${k ? "bg-emerald-400" : "bg-sky-500"}`}
                        style={{
                          width: `${U}%`,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800 text-slate-400">
                      <span>{V.length} Lessons</span>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/courses#chapter-${chapter.id}`}
                          className="hover:text-sky-400 font-semibold transition-colors"
                        >
                          Syllabus
                        </Link>
                        <span>•</span>
                        <Link
                          to={`/quiz/${chapter.id}`}
                          className="hover:text-amber-400 font-semibold text-amber-400/90 transition-colors"
                        >
                          Quiz
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="lg:col-span-4 space-y-6">
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Bookmarked Lectures</h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">{x.length}</span>
            </div>
            {x.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                No bookmarked lessons yet. Click the bookmark icon inside any lesson player to save it here!
              </p>
            ) : (
              <div className="space-y-2">
                {x.map((R) => (
                  <Link
                    key={R.id}
                    to={`/lesson/${R.id}`}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 transition-colors group"
                  >
                    <div className="truncate pr-2">
                      <span className="text-[11px] text-sky-400 font-bold block">Lesson {R.orderIndex}</span>
                      <span className="truncate font-medium">{R.title}</span>
                    </div>
                    <Play className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-400 shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-400" />
                <h3 className="font-bold text-sm text-white">Recent Study Notes</h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">{notes.length}</span>
            </div>
            {notes.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                Take timestamped notes in any lesson to jump back to key explanations!
              </p>
            ) : (
              <div className="space-y-2.5">
                {notes.slice(0, 3).map((note) => {
                  const U = Math.floor(note.timestampSeconds / 60);
                  const V = note.timestampSeconds % 60;
                  const k = `${U}:${V < 10 ? "0" : ""}${V}`;
                  return (
                    <div
                      key={note.id}
                      className="p-3 rounded-lg bg-slate-850 border border-slate-800 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <Link
                          to={`/lesson/${note.lessonId}`}
                          className="font-bold text-sky-400 hover:underline flex items-center gap-1"
                        >
                          Lesson {note.lessonId}
                          <span className="px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-400 text-[10px] font-mono">
                            @{k}
                          </span>
                        </Link>
                        <span className="text-[10px] text-slate-400">{note.createdAt}</span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-2">
                        {note.content}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="p-5 rounded-xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/20 space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Developer Cheatsheets</span>
            </div>
            <p className="text-xs text-slate-300">
              Need a quick refresher on JavaScript array methods, Flexbox centering, or Git commands?
            </p>
            <Link
              to="/resources"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300"
            >
              <span>Browse Technical Cheatsheets →</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
