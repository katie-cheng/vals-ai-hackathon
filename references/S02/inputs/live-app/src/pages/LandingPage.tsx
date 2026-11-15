import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Award,
  BookOpen,
  ChevronDown,
  CircleQuestionMark,
  CodeXml,
  Flame,
  Laptop,
  Play,
  Sparkles,
  Terminal,
  Users,
} from "lucide-react";
import { CHAPTERS } from "../data/chapters";
import { LESSONS } from "../data/lessons";
import { useCourse } from "../context/CourseContext";

export const LandingPage = () => {
  useNavigate();
  const { totalCompletedCount, lastResumeLessonId } = useCourse();
  const [f, i] = React.useState(1);
  const [p, h] = React.useState('Press "Run JavaScript" to evaluate');
  const v = () => {
    try {
      h(
        "🚀 Welcome to IT Beginner! 42 lessons, 6 chapters loaded. Ready to build full-stack web applications.",
      );
    } catch {
      h("Code execution failed.");
    }
  };
  return (
    <div className="space-y-20 pb-16">
      <section className="relative overflow-hidden pt-12 lg:pt-20">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-sky-600/20 to-indigo-600/20 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>Production-Grade Full-Stack Curriculum • 42 Lessons</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                Master Full-Stack Web Development{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400">
                  from Zero to Production.
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Modeled after leading LMS platforms (Coursera, Scrimba, Udemy). Engineered specifically for
                the <strong>AjinLab IT Beginner</strong> curriculum: 42 video lessons across 6 chapters,
                in-browser live code sandbox, chapter quizzes, and verifiable printable certificates of
                completion.
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to={`/lesson/${lastResumeLessonId}`}
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-sky-500/25 hover:shadow-sky-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Resume Lesson {lastResumeLessonId}</span>
                </Link>
                <Link
                  to="/courses"
                  className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-sm border border-slate-700 transition-all"
                >
                  <BookOpen className="w-4 h-4 text-sky-400" />
                  <span>Explore 6 Chapters</span>
                </Link>
                <Link
                  to="/playground"
                  className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-sm border border-slate-800 transition-all"
                >
                  <CodeXml className="w-4 h-4 text-indigo-400" />
                  <span>Interactive Sandbox</span>
                </Link>
              </div>
              <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-800 text-center lg:text-left">
                <div>
                  <p className="text-2xl font-black text-white">42</p>
                  <p className="text-xs text-slate-400 font-medium">Video Lessons</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-sky-400">6</p>
                  <p className="text-xs text-slate-400 font-medium">Structured Chapters</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-emerald-400">100%</p>
                  <p className="text-xs text-slate-400 font-medium">{"Free & Open Source"}</p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                    <span className="ml-2 font-mono text-slate-400 text-[11px]">in-lesson-scratchpad.js</span>
                  </div>
                  <span className="text-[11px] font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">
                    Live Evaluation
                  </span>
                </div>
                <div className="py-4 font-mono text-xs leading-relaxed text-slate-200">
                  <p className="text-slate-500">// Chapter 3: Web Development Fundamentals</p>
                  <p>
                    <span className="text-indigo-400">const</span>{" "}
                    <span className="text-sky-300">platform</span> ={" "}
                    <span className="text-amber-300">"IT Beginner"</span>;
                  </p>
                  <p>
                    <span className="text-indigo-400">const</span>{" "}
                    <span className="text-sky-300">curriculum</span>
                    {" = {"}
                  </p>
                  <p className="pl-4">
                    lessons: <span className="text-emerald-400">42</span>,
                  </p>
                  <p className="pl-4">
                    framework: <span className="text-amber-300">"Vue.js + REST APIs"</span>,
                  </p>
                  <p className="pl-4">
                    hasQuizzes: <span className="text-purple-400">true</span>,
                  </p>
                  <p className="pl-4">
                    printableCertificate: <span className="text-purple-400">true</span>
                  </p>
                  <p>{"};"}</p>
                  <p className="text-slate-400 mt-2">
                    console.log(<span className="text-amber-300">"Ready to learn full-stack web tech!"</span>
                    );
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-sky-400 mb-4 flex items-center justify-between">
                  <span className="truncate">{p}</span>
                  <button
                    onClick={v}
                    className="ml-2 px-3 py-1 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-[10px] shrink-0 transition-colors"
                  >
                    Run JS
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-800/60 border border-slate-750">
                    <Award className="w-4 h-4 text-amber-400" />
                    <div>
                      <p className="font-bold text-white text-[11px]">Gold Seal Credentials</p>
                      <p className="text-[10px] text-slate-400">Verifiable Code</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-800/60 border border-slate-750">
                    <Terminal className="w-4 h-4 text-sky-400" />
                    <div>
                      <p className="font-bold text-white text-[11px]">Tabbed Code Sandbox</p>
                      <p className="text-[10px] text-slate-400">HTML • CSS • JS</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-sky-400">
            Engineered For Student Success
          </h2>
          <p className="text-3xl font-extrabold text-white">
            Everything you need to master modern software development
          </p>
          <p className="text-sm text-slate-400">
            No fragmented YouTube tutorials or outdated text blogs. Every lesson is integrated with active
            learning tools.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all hover:translate-y-[-2px] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Play className="w-5 h-5 fill-sky-400" />
            </div>
            <h3 className="font-bold text-lg text-white">Enhanced Video Player</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Auto-resume from your exact second, 1.25x / 1.5x / 2x playback speed, power-user keyboard
              shortcuts (<kbd className="px-1 py-0.5 bg-slate-800 rounded">Space</kbd>,{" "}
              <kbd className="px-1 py-0.5 bg-slate-800 rounded">←</kbd>,{" "}
              <kbd className="px-1 py-0.5 bg-slate-800 rounded">→</kbd>), and interactive transcript jump
              links.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all hover:translate-y-[-2px] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <CodeXml className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-white">In-Browser Code Sandbox</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tabbed editor for HTML, CSS, and JavaScript with isolated sandboxed iframe preview, console log
              capture, and 4 course practice presets saved directly in your browser.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all hover:translate-y-[-2px] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CircleQuestionMark className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-white">Chapter Assessments</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Multi-question chapter quizzes with instant visual feedback, comprehensive technical
              explanations, score tracking, and automated certificate issuance upon passing.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all hover:translate-y-[-2px] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-white">Verifiable Certificates</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Unlock official gold-sealed completion credentials with unique verification serial codes and
              print-optimized PDF layout to showcase on LinkedIn or your portfolio.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all hover:translate-y-[-2px] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-white">{"Community Q&A & Notes"}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Post lesson-specific questions with verified instructor badges, upvote peer solutions, and
              create timestamped notes that jump the video to that exact second.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all hover:translate-y-[-2px] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Laptop className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-white">{"Cheatsheets & Handbooks"}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {
                "Instant syntax references covering JavaScript ES6+, HTML5 semantic tags, CSS Box Model & Flexbox, Agile & Scrum ceremonies, and Command Line / NPM commands."
              }
            </p>
          </div>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                Complete Syllabus
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                42 Lessons across 6 Structured Chapters
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Click any chapter below to explore the detailed lesson curriculum and key concepts.
              </p>
            </div>
            <Link
              to="/courses"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300"
            >
              <span>View Full Interactive Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {CHAPTERS.map((chapter) => {
              const S = f === chapter.id;
              const M = LESSONS.filter((lesson) => lesson.chapterId === chapter.id);
              return (
                <div
                  key={chapter.id}
                  className="rounded-xl bg-slate-850 border border-slate-750 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => i(S ? null : chapter.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{chapter.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-sky-400">Chapter {chapter.orderIndex}</span>
                          <span className="text-[11px] text-slate-400">• {M.length} Lessons</span>
                          <span className="text-[11px] text-slate-400">• {chapter.estimatedHours}</span>
                        </div>
                        <h3 className="font-bold text-white text-sm sm:text-base">{chapter.title}</h3>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition-transform ${S ? "rotate-180" : ""}`}
                    />
                  </button>
                  {S && (
                    <div className="p-4 pt-1 border-t border-slate-800 bg-slate-900/60 space-y-2 text-xs">
                      <p className="text-slate-300 text-xs mb-3">{chapter.description}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {M.map((b) => (
                          <Link
                            key={b.id}
                            to={`/lesson/${b.id}`}
                            className="flex items-center justify-between p-2.5 rounded-lg bg-slate-850/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 hover:border-slate-700 transition-all group"
                          >
                            <span className="truncate pr-2 font-medium">
                              {b.orderIndex}. {b.title}
                            </span>
                            <span className="text-[11px] text-slate-400 group-hover:text-sky-400 shrink-0 font-mono">
                              {b.durationMinutes}m →
                            </span>
                          </Link>
                        ))}
                      </div>
                      <div className="pt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] text-slate-400">Key Concepts:</span>
                          {chapter.keyConcepts.map((keyConcept) => (
                            <span
                              key={keyConcept}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-sky-300"
                            >
                              {keyConcept}
                            </span>
                          ))}
                        </div>
                        <Link
                          to={`/quiz/${chapter.id}`}
                          className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                        >
                          <CircleQuestionMark className="w-3.5 h-3.5" />
                          <span>Take Chapter {chapter.id} Assessment →</span>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-900/60 via-indigo-900/60 to-purple-900/60 border border-sky-500/30 p-8 sm:p-12 text-center space-y-6">
          <div className="max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              Start Your Daily Study Streak Today
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Ready to code your first web application?
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Jump straight into Lesson 1 or continue from where you paused. All progress, notes, code
              snippets, and certificates are saved automatically in your browser.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/lesson/1"
              className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-extrabold text-sm shadow-xl hover:scale-105 transition-all"
            >
              Start From Lesson 1 (Welcome)
            </Link>
            <Link
              to="/dashboard"
              className="px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white font-bold text-sm border border-slate-700 transition-all"
            >
              Open Student Learning Hub
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
