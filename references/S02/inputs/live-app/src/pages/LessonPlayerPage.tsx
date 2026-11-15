import * as React from "react";
import confetti from "canvas-confetti";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  BookOpen,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleQuestionMark,
  Clock,
  FileText,
  Maximize2,
  MessageSquare,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Terminal,
  ThumbsUp,
  Trash2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { CHAPTERS } from "../data/chapters";
import { LESSONS } from "../data/lessons";
import { useCourse } from "../context/CourseContext";

export const LessonPlayerPage = () => {
  const { id: id2 } = useParams();
  useNavigate();
  const d = parseInt(id2 || "1", 10);
  const {
    progress,
    updateLessonProgress,
    bookmarks,
    toggleBookmark,
    notes,
    addNote,
    deleteNote,
    discussions,
    addDiscussion,
    addDiscussionReply,
    upvoteDiscussion,
    currentUser,
  } = useCourse();
  const U = LESSONS.find((lesson) => lesson.id === d) || LESSONS[0];
  const V = CHAPTERS.find((chapter) => chapter.id === U.chapterId) || CHAPTERS[0];
  const k = LESSONS.filter((lesson) => lesson.chapterId === U.chapterId);
  const [F, $] = React.useState(true);
  const [te, me] = React.useState(0);
  const [ue, be] = React.useState(U.durationMinutes * 60);
  const [ne, pe] = React.useState(1);
  const [Be, re] = React.useState(false);
  const [Le, qe] = React.useState(0.8);
  const [Ye, it] = React.useState(false);
  const [Ce, X] = React.useState(false);
  const [le, oe] = React.useState("overview");
  const [Ee, E] = React.useState(
    U.interactiveCode?.initialCode || U.codeExample || 'console.log("Hello from Lesson!");',
  );
  const [g, Y] = React.useState('Ready. Click "Run Code" to execute in sandbox.');
  const [G, m] = React.useState("");
  const [z, q] = React.useState("");
  const [B, J] = React.useState(null);
  const [W, ce] = React.useState("");
  const I = progress[U.id];
  const K = I?.status === "completed";
  const De = bookmarks.includes(U.id);
  React.useEffect(() => {
    const Q = I?.lastPositionSeconds || 0;
    me(Q);
    be(U.durationMinutes * 60);
    $(true);
    E(U.interactiveCode?.initialCode || U.codeExample || 'console.log("Hello from Lesson!");');
    Y('Ready. Click "Run Code" to execute in sandbox.');
  }, [d]);
  React.useEffect(() => {
    let Q;
    if (F) {
      Q = setInterval(() => {
        me((de) => {
          const Fe = de + 1 * ne;
          if (Fe >= ue) {
            $(false);
            updateLessonProgress(U.id, 100, ue, "completed");
            confetti({
              particleCount: 70,
              spread: 60,
              origin: {
                y: 0.7,
              },
            });
            return ue;
          }
          if (Math.floor(Fe) % 10 === 0) {
            const Qe = Math.round((Fe / ue) * 100);
            updateLessonProgress(U.id, Qe, Math.floor(Fe));
          }
          return Fe;
        });
      }, 1e3);
    }
    return () => clearInterval(Q);
  }, [F, ne, ue, U.id]);
  React.useEffect(() => {
    const Q = (event) => {
      const Fe = event.target;
      if (!(Fe.tagName === "INPUT" || Fe.tagName === "TEXTAREA")) {
        if (event.code === "Space" || event.key === "k") {
          event.preventDefault();
          $((Qe) => !Qe);
        } else {
          if (event.code === "ArrowLeft") {
            event.preventDefault();
            me((Qe) => Math.max(0, Qe - 5));
          } else {
            if (event.code === "ArrowRight") {
              event.preventDefault();
              me((Qe) => Math.min(ue, Qe + 5));
            } else {
              if (event.key === "m" || event.key === "M") {
                event.preventDefault();
                re((Qe) => !Qe);
              } else {
                if (event.key === "f" || event.key === "F") {
                  event.preventDefault();
                  it((Qe) => !Qe);
                }
              }
            }
          }
        }
      }
    };
    window.addEventListener("keydown", Q);
    return () => window.removeEventListener("keydown", Q);
  }, [ue]);
  const xe = (Q) => {
    const de = Math.floor(Q / 60);
    const Fe = Math.floor(Q % 60);
    return `${de}:${Fe < 10 ? "0" : ""}${Fe}`;
  };
  const Ze = () => {
    try {
      const Q = [];
      const de = {
        log: (...Qe) =>
          Q.push(Qe.map((Ea) => (typeof Ea == "object" ? JSON.stringify(Ea) : String(Ea))).join(" ")),
        warn: (...Qe) => Q.push("[WARN] " + Qe.join(" ")),
        error: (...Qe) => Q.push("[ERROR] " + Qe.join(" ")),
      };
      new Function("console", Ee)(de);
      Y(
        Q.length
          ? Q.join(`
`)
          : "Code executed with no output.",
      );
    } catch (error) {
      Y("Syntax / Runtime Error: " + error.message);
    }
  };
  const Ie = (event) => {
    event.preventDefault();
    if (G.trim()) {
      addNote(U.id, G.trim(), Math.floor(te));
      m("");
    }
  };
  const Me = (event) => {
    event.preventDefault();
    if (z.trim()) {
      addDiscussion(U.id, z.trim());
      q("");
    }
  };
  const Se = (Q) => {
    if (W.trim()) {
      addDiscussionReply(Q, W.trim());
      ce("");
      J(null);
    }
  };
  const We = discussions.filter((discussion) => discussion.lessonId === U.id);
  const st = notes.filter((note) => note.lessonId === U.id);
  const St = LESSONS.find((lesson) => lesson.id === U.id - 1);
  const la = LESSONS.find((lesson) => lesson.id === U.id + 1);
  return (
    <div className={`mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 ${Ye ? "max-w-full" : "max-w-7xl"}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Link to="/courses" className="hover:text-white transition-colors">
            Curriculum
          </Link>
          <span>{">"}</span>
          <Link to={`/courses#chapter-${V.id}`} className="text-sky-400 hover:underline">
            Ch {V.orderIndex}: {V.title}
          </Link>
          <span>{">"}</span>
          <span className="text-slate-200 font-semibold truncate max-w-xs">
            Lesson {U.orderIndex}: {U.title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleBookmark(U.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${De ? "bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold" : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"}`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${De ? "fill-amber-400" : ""}`} />
            <span>{De ? "Bookmarked" : "Bookmark"}</span>
          </button>
          <button
            onClick={() => {
              const Q = K ? "in_progress" : "completed";
              updateLessonProgress(U.id, K ? 50 : 100, te, Q);
              if (!K) {
                confetti({
                  particleCount: 50,
                  spread: 50,
                });
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-colors ${K ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"}`}
          >
            <CircleCheck className="w-3.5 h-3.5" />
            <span>{K ? "Completed" : "Mark as Done"}</span>
          </button>
          <button
            onClick={() => X(!Ce)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
            title="Keyboard shortcuts"
          >
            <CircleQuestionMark className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className={Ye ? "lg:col-span-12" : "lg:col-span-8"}>
          <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl relative">
            <div className="relative aspect-video bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950/80 flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-slate-900/80 border border-slate-800 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>IT Beginner • Chapter {V.orderIndex}</span>
              </div>
              <div className="absolute top-4 right-4 text-[11px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                {U.videoFilename.substring(0, 24)}...
              </div>
              <div className="relative z-10 max-w-lg space-y-3">
                <span className="text-3xl">{V.icon}</span>
                <div className="inline-block px-2.5 py-0.5 rounded bg-sky-500/20 text-sky-400 text-xs font-mono font-bold">
                  LESSON #{U.orderIndex}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{U.title}</h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto line-clamp-2">
                  {U.description}
                </p>
                <div className="pt-2 flex items-center justify-center gap-2">
                  <span className="text-[11px] font-mono text-sky-400">
                    Playing: {xe(te)} / {xe(ue)}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-[11px] text-slate-400">{ne}x Speed</span>
                </div>
              </div>
              <button
                onClick={() => $(!F)}
                className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors group cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-sky-500/90 text-slate-950 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                  {F ? (
                    <Pause className="w-7 h-7 fill-slate-950" />
                  ) : (
                    <Play className="w-7 h-7 fill-slate-950 ml-1" />
                  )}
                </div>
              </button>
            </div>
            <div className="p-3 bg-slate-900 border-t border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span>{xe(te)}</span>
                <div
                  className="flex-1 bg-slate-800 h-2 rounded-full cursor-pointer relative overflow-hidden group"
                  onClick={(event) => {
                    const de = event.currentTarget.getBoundingClientRect();
                    const Qe = (event.clientX - de.left) / de.width;
                    me(Qe * ue);
                  }}
                >
                  <div
                    className="bg-gradient-to-r from-sky-400 to-indigo-500 h-full rounded-full transition-all"
                    style={{
                      width: `${(te / ue) * 100}%`,
                    }}
                  />
                </div>
                <span>{xe(ue)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => $(!F)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-white transition-colors"
                  >
                    {F ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                  </button>
                  <button
                    onClick={() => me((Q) => Math.max(0, Q - 5))}
                    className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                    title="Seek -5s (Left Arrow)"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => me((Q) => Math.min(ue, Q + 5))}
                    className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                    title="Seek +5s (Right Arrow)"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => re(!Be)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                    title="Mute/Unmute (M)"
                  >
                    {Be ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded-lg font-mono text-[11px]">
                    {[0.75, 1, 1.25, 1.5, 2].map((Q) => (
                      <button
                        key={Q}
                        onClick={() => pe(Q)}
                        className={`px-1 py-0.5 rounded transition-colors ${ne === Q ? "bg-sky-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"}`}
                      >
                        {Q}x
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => it(!Ye)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-300"
                    title="Theater Mode (F)"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 text-xs font-semibold">
            {St ? (
              <Link
                to={`/lesson/${St.id}`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>
                  Prev: #{St.id} {St.title}
                </span>
              </Link>
            ) : (
              <div />
            )}
            {la ? (
              <Link
                to={`/lesson/${la.id}`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition-all shadow-md"
              >
                <span>
                  Next: #{la.id} {la.title}
                </span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                to={`/quiz/${V.id}`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-md"
              >
                <span>Take Chapter Quiz →</span>
              </Link>
            )}
          </div>
        </div>
        {!Ye && (
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-sky-400" />
                  <h3 className="font-bold text-sm text-white">
                    Chapter {V.orderIndex}: {V.title}
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {k.filter((Q) => progress[Q.id]?.status === "completed").length} / {k.length}
                </span>
              </div>
              <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                {k.map((Q) => {
                  const de = Q.id === U.id;
                  const Fe = progress[Q.id]?.status === "completed";
                  return (
                    <Link
                      key={Q.id}
                      to={`/lesson/${Q.id}`}
                      className={`flex items-center justify-between p-2.5 rounded-lg text-xs transition-all ${de ? "bg-sky-500/15 border border-sky-500/40 text-sky-300 font-bold" : Fe ? "bg-slate-850 hover:bg-slate-800 text-slate-300 border border-transparent" : "hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-transparent"}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold ${Fe ? "bg-emerald-500/20 text-emerald-400" : de ? "bg-sky-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}
                        >
                          {Fe ? "✓" : Q.orderIndex}
                        </div>
                        <span className="truncate">{Q.title}</span>
                      </div>
                      <span className="text-[10px] font-mono shrink-0 text-slate-400">
                        {Q.durationMinutes}m
                      </span>
                    </Link>
                  );
                })}
              </div>
              <div className="pt-2 border-t border-slate-800">
                <Link
                  to={`/quiz/${V.id}`}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <CircleQuestionMark className="w-4 h-4 text-amber-400" />
                    <span>Chapter {V.orderIndex} Quiz</span>
                  </span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="flex items-center gap-1 p-2 bg-slate-950 border-b border-slate-800 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => oe("overview")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors ${le === "overview" ? "bg-sky-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"}`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{"Overview & Objectives"}</span>
          </button>
          <button
            onClick={() => oe("scratchpad")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors ${le === "scratchpad" ? "bg-sky-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"}`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Live Scratchpad</span>
          </button>
          <button
            onClick={() => oe("notes")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors ${le === "notes" ? "bg-sky-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"}`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>My Notes ({st.length})</span>
          </button>
          <button
            onClick={() => oe("discussion")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors ${le === "discussion" ? "bg-sky-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"}`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>
              {"Q&A Community ("}
              {We.length})
            </span>
          </button>
          <button
            onClick={() => oe("transcript")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors ${le === "transcript" ? "bg-sky-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"}`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Interactive Transcript</span>
          </button>
        </div>
        {le === "overview" && (
          <div className="p-6 space-y-6 text-xs sm:text-sm">
            <div className="space-y-2">
              <h3 className="text-base font-bold text-white">Learning Objectives</h3>
              <ul className="space-y-1.5 text-slate-300">
                {U.learningObjectives.map((learningObjective, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CircleCheck className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <span>{learningObjective}</span>
                  </li>
                ))}
              </ul>
            </div>
            {U.codeExample && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Lesson Code Reference</h3>
                  <button
                    onClick={() => {
                      E(U.codeExample);
                      oe("scratchpad");
                    }}
                    className="text-xs text-sky-400 hover:underline flex items-center gap-1"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Copy to Scratchpad</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-sky-300 overflow-x-auto leading-relaxed">
                  <code>{U.codeExample}</code>
                </pre>
              </div>
            )}
            <div className="space-y-2">
              <h3 className="text-base font-bold text-white">Key Takeaways</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {U.keyTakeaways.map((keyTakeaway, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-slate-850 border border-slate-800 text-slate-300 text-xs leading-relaxed"
                  >
                    <strong>•</strong> {keyTakeaway}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {le === "scratchpad" && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Interactive JavaScript Scratchpad</h3>
                <p className="text-xs text-slate-400">
                  Test concepts right below the video without opening another tab.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => E(U.interactiveCode?.initialCode || U.codeExample || "")}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Reset Code
                </button>
                <button
                  onClick={Ze}
                  className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-colors"
                >
                  Run Code
                </button>
              </div>
            </div>
            <textarea
              value={Ee}
              onChange={(event) => E(event.target.value)}
              rows={8}
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-sky-200 focus:outline-none focus:border-sky-500 leading-relaxed resize-y"
              placeholder="Write your JavaScript code here..."
            />
            <div>
              <p className="text-xs font-bold text-slate-400 mb-1 font-mono">Sandbox Console Output:</p>
              <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 whitespace-pre-wrap leading-relaxed min-h-[60px]">
                {g}
              </pre>
            </div>
          </div>
        )}
        {le === "notes" && (
          <div className="p-6 space-y-6">
            <form onSubmit={Ie} className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">
                  New Note @ <span className="text-sky-400 font-mono">{xe(te)}</span>
                </span>
                <span className="text-slate-400">Notes are saved with video timestamp</span>
              </div>
              <textarea
                value={G}
                onChange={(event) => m(event.target.value)}
                placeholder="Write your observation or key insight here..."
                rows={3}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-colors"
              >
                Save Timestamped Note
              </button>
            </form>
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-white">Your Saved Notes for Lesson {U.orderIndex}</h4>
              {st.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No notes saved yet for this lesson.</p>
              ) : (
                st.map((Q) => (
                  <div
                    key={Q.id}
                    className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => me(Q.timestampSeconds)}
                        className="font-mono text-sky-400 hover:underline font-bold text-xs"
                      >
                        Seek @{xe(Q.timestampSeconds)}
                      </button>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">{Q.createdAt}</span>
                        <button
                          onClick={() => deleteNote(Q.id)}
                          className="text-slate-400 hover:text-rose-400"
                          title="Delete note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-slate-200 leading-relaxed">{Q.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        {le === "discussion" && (
          <div className="p-6 space-y-6">
            <form onSubmit={Me} className="space-y-3">
              <h4 className="font-bold text-sm text-white">Ask a Question or Share Feedback</h4>
              <textarea
                value={z}
                onChange={(event) => q(event.target.value)}
                placeholder="Have a question about this lesson? Ask the instructor and community..."
                rows={3}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-colors"
              >
                Post Question
              </button>
            </form>
            <div className="space-y-4">
              {We.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">
                  No questions yet for this lesson. Be the first to ask!
                </p>
              ) : (
                We.map((Q) => (
                  <div
                    key={Q.id}
                    className="p-4 rounded-xl bg-slate-850 border border-slate-800 text-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={Q.userAvatar}
                          alt={Q.userName}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white">{Q.userName}</span>
                            {Q.userRole === "admin" && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300">
                                👨‍🏫 Instructor
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">{Q.createdAt}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => upvoteDiscussion(Q.id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${Q.hasUpvoted ? "bg-sky-500/20 text-sky-400" : "bg-slate-800 text-slate-400 hover:text-white"}`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{Q.upvotes}</span>
                      </button>
                    </div>
                    <p className="text-slate-200 leading-relaxed">{Q.content}</p>
                    {Q.replies.length > 0 && (
                      <div className="pl-4 border-l-2 border-slate-800 space-y-2 pt-2">
                        {Q.replies.map((reply) => (
                          <div
                            key={reply.id}
                            className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1"
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white">{reply.userName}</span>
                              {reply.userRole === "admin" && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300">
                                  👨‍🏫 Instructor
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400">• {reply.createdAt}</span>
                            </div>
                            <p className="text-slate-300 text-xs leading-relaxed">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="pt-1">
                      {B === Q.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={W}
                            onChange={(event) => ce(event.target.value)}
                            placeholder="Write a helpful reply..."
                            className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => Se(Q.id)}
                              className="px-3 py-1 rounded bg-sky-500 text-slate-950 text-xs font-bold"
                            >
                              Send Reply
                            </button>
                            <button
                              onClick={() => J(null)}
                              className="px-3 py-1 text-slate-400 hover:text-white text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => J(Q.id)}
                          className="text-xs font-bold text-sky-400 hover:underline"
                        >
                          Reply to thread
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        {le === "transcript" && (
          <div className="p-6 space-y-3">
            <p className="text-xs text-slate-400">
              Click any timestamp below to jump the video directly to that sentence:
            </p>
            <div className="space-y-2">
              {U.transcript.map((item, index) => (
                <button
                  key={index}
                  onClick={() => me(item.timeSeconds)}
                  className="w-full text-left p-3 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 transition-colors flex items-start gap-3 group"
                >
                  <span className="font-mono text-sky-400 font-bold shrink-0 group-hover:underline">
                    {xe(item.timeSeconds)}
                  </span>
                  <span className="leading-relaxed">{item.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {Ce && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => X(false)}
        >
          <div
            className="rounded-2xl bg-slate-900 border border-slate-800 p-6 max-w-sm w-full space-y-4 text-xs"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white">Video Keyboard Shortcuts</h3>
              <button onClick={() => X(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                <span>Play / Pause</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-sky-400 font-mono">Space or K</kbd>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                <span>Seek Backward 5s</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-sky-400 font-mono">← Arrow</kbd>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                <span>Seek Forward 5s</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-sky-400 font-mono">→ Arrow</kbd>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                <span>Mute / Unmute</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-sky-400 font-mono">M</kbd>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                <span>Theater Mode</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-sky-400 font-mono">F</kbd>
              </div>
            </div>
            <button
              onClick={() => X(false)}
              className="w-full py-2 rounded-lg bg-sky-500 text-slate-950 font-bold"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
