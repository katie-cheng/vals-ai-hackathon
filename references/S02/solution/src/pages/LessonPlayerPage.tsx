import * as React from "react";
import { Link, useParams } from "react-router-dom";
import { Bookmark, Check, ChevronLeft, ChevronRight, Keyboard, Maximize2, Minimize2, Pause, Play, RotateCcw, RotateCw, ThumbsUp, Trash2, X } from "lucide-react";
import { CHAPTERS } from "../data/chapters";
import { LESSONS } from "../data/lessons";
import { Avatar } from "../components/Avatar";
import { useCourse } from "../context/CourseContext";

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];
const SHORTCUTS = [
  ["Play or pause", "Space or K"],
  ["Back 5 seconds", "Left arrow"],
  ["Forward 5 seconds", "Right arrow"],
  ["Theater mode", "F"],
];
const SCRATCHPAD_READY = "Run the code to see its console output.";

const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

export const LessonPlayerPage = () => {
  const { id } = useParams();
  const lessonId = parseInt(id || "1", 10);
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
  } = useCourse();
  const lesson: any = LESSONS.find((item) => item.id === lessonId) || LESSONS[0];
  const chapter = CHAPTERS.find((item) => item.id === lesson.chapterId) || CHAPTERS[0];
  const chapterLessons = LESSONS.filter((item) => item.chapterId === lesson.chapterId);
  const starterCode = lesson.interactiveCode?.initialCode || lesson.codeExample || 'console.log("Hello from Lesson!");';
  const duration = lesson.durationMinutes * 60;

  const [playing, setPlaying] = React.useState(false);
  const [position, setPosition] = React.useState(0);
  const [speed, setSpeed] = React.useState(1);
  const [theater, setTheater] = React.useState(false);
  const [shortcutsOpen, setShortcutsOpen] = React.useState(false);
  const [tab, setTab] = React.useState("overview");
  const [code, setCode] = React.useState(starterCode);
  const [output, setOutput] = React.useState(SCRATCHPAD_READY);
  const [noteDraft, setNoteDraft] = React.useState("");
  const [noteError, setNoteError] = React.useState("");
  const [questionDraft, setQuestionDraft] = React.useState("");
  const [questionError, setQuestionError] = React.useState("");
  const [replyTo, setReplyTo] = React.useState<string | number | null>(null);
  const [replyDraft, setReplyDraft] = React.useState("");
  const [replyError, setReplyError] = React.useState("");
  const closeShortcutsRef = React.useRef<HTMLButtonElement>(null);

  const lessonProgress = progress[lesson.id];
  const completed = lessonProgress?.status === "completed";
  const bookmarked = bookmarks.includes(lesson.id);

  React.useEffect(() => {
    setPosition(Math.min(lessonProgress?.lastPositionSeconds || 0, duration));
    setPlaying(false);
    setCode(starterCode);
    setOutput(SCRATCHPAD_READY);
    setNoteError("");
    setQuestionError("");
    setReplyTo(null);
  }, [lessonId]);

  React.useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setPosition((current) => {
        const next = current + speed;
        if (next >= duration) {
          setPlaying(false);
          updateLessonProgress(lesson.id, 100, duration, "completed");
          return duration;
        }
        if (Math.floor(next) % 10 === 0) updateLessonProgress(lesson.id, Math.round((next / duration) * 100), Math.floor(next));
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [playing, speed, duration, lesson.id]);

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A"].includes(target.tagName) || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.code === "Space" || event.key === "k") {
        event.preventDefault();
        setPlaying((value) => !value);
      } else if (event.code === "ArrowLeft") {
        event.preventDefault();
        setPosition((value) => Math.max(0, value - 5));
      } else if (event.code === "ArrowRight") {
        event.preventDefault();
        setPosition((value) => Math.min(duration, value + 5));
      } else if (event.key === "f" || event.key === "F") {
        event.preventDefault();
        setTheater((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [duration]);

  React.useEffect(() => {
    if (!shortcutsOpen) return;
    closeShortcutsRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShortcutsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [shortcutsOpen]);

  const runCode = () => {
    try {
      const lines: string[] = [];
      const sandboxConsole = {
        log: (...args: any[]) => lines.push(args.map((arg) => (typeof arg == "object" ? JSON.stringify(arg) : String(arg))).join(" ")),
        warn: (...args: any[]) => lines.push("[WARN] " + args.join(" ")),
        error: (...args: any[]) => lines.push("[ERROR] " + args.join(" ")),
      };
      new Function("console", code)(sandboxConsole);
      setOutput(lines.length ? lines.join("\n") : "Code executed with no output.");
    } catch (error: any) {
      setOutput("Syntax or runtime error: " + error.message);
    }
  };

  const submitNote = (event: React.FormEvent) => {
    event.preventDefault();
    if (!noteDraft.trim()) return setNoteError("Write a note before saving.");
    addNote(lesson.id, noteDraft.trim(), Math.floor(position));
    setNoteDraft("");
    setNoteError("");
  };
  const submitQuestion = (event: React.FormEvent) => {
    event.preventDefault();
    if (!questionDraft.trim()) return setQuestionError("Write a question before posting.");
    addDiscussion(lesson.id, questionDraft.trim());
    setQuestionDraft("");
    setQuestionError("");
  };
  const submitReply = (event: React.FormEvent, discussionId: string | number) => {
    event.preventDefault();
    if (!replyDraft.trim()) return setReplyError("Write a reply before sending.");
    addDiscussionReply(discussionId, replyDraft.trim());
    setReplyDraft("");
    setReplyError("");
    setReplyTo(null);
  };

  const lessonDiscussions = discussions.filter((discussion: any) => discussion.lessonId === lesson.id);
  const lessonNotes = notes.filter((note: any) => note.lessonId === lesson.id);
  const previous = LESSONS.find((item) => item.id === lesson.id - 1);
  const next = LESSONS.find((item) => item.id === lesson.id + 1);
  const caption = [...lesson.transcript].reverse().find((item: any) => item.timeSeconds <= position) || lesson.transcript[0];
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "scratchpad", label: "Scratchpad" },
    { id: "notes", label: `Notes (${lessonNotes.length})` },
    { id: "discussion", label: `Q&A (${lessonDiscussions.length})` },
    { id: "transcript", label: "Transcript" },
  ];

  return (
    <div className="container-page page">
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm text-ink-3">
        <Link to="/courses" className="flex-none transition-colors hover:text-ink">
          Curriculum
        </Link>
        <ChevronRight className="h-4 w-4 flex-none" strokeWidth={1.75} aria-hidden="true" />
        <Link to={`/courses#chapter-${chapter.id}`} className="truncate transition-colors hover:text-ink">
          {chapter.title}
        </Link>
      </nav>
      <div className="mt-3 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div className="min-w-0">
          <h1 className="page-title">{lesson.title}</h1>
          <p className="meta mt-1">
            Chapter {chapter.orderIndex}, lesson {lesson.orderIndex}, {lesson.durationMinutes} min
          </p>
        </div>
        <div className="flex flex-none flex-wrap items-center gap-2">
          <button type="button" onClick={() => toggleBookmark(lesson.id)} aria-pressed={bookmarked} className="btn btn-secondary w-[8.5rem]">
            <Bookmark className={`h-4 w-4 ${bookmarked ? "text-warn" : ""}`} strokeWidth={1.75} fill={bookmarked ? "currentColor" : "none"} aria-hidden="true" />
            {bookmarked ? "Bookmarked" : "Bookmark"}
          </button>
          <button
            type="button"
            onClick={() => updateLessonProgress(lesson.id, completed ? 50 : 100, position, completed ? "in_progress" : "completed")}
            aria-pressed={completed}
            className="btn btn-secondary w-[8.5rem]"
          >
            {completed && <Check className="h-4 w-4 text-ok" strokeWidth={2} aria-hidden="true" />}
            {completed ? "Completed" : "Mark as done"}
          </button>
          <button type="button" onClick={() => setShortcutsOpen(true)} className="icon-btn border border-line-strong" aria-label="Keyboard shortcuts">
            <Keyboard className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className={`min-w-0 ${theater ? "lg:col-span-12" : "lg:col-span-8"}`}>
          <div className="surface overflow-hidden">
            <button
              type="button"
              onClick={() => setPlaying(!playing)}
              aria-label={playing ? "Pause lesson" : "Play lesson"}
              className="group relative flex aspect-video w-full flex-col items-center justify-center gap-5 bg-[#080c14] px-6 text-center"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-line-strong text-ink transition-colors group-hover:border-accent group-hover:text-accent">
                {playing ? <Pause className="h-6 w-6" strokeWidth={1.75} /> : <Play className="ml-0.5 h-6 w-6" strokeWidth={1.75} />}
              </span>
              <span className="line-clamp-3 min-h-[4.5rem] max-w-xl text-base text-ink-2 sm:text-lg">{caption?.text}</span>
            </button>
            <div className="border-t border-line px-3 py-2">
              <div className="flex items-center gap-3">
                <span className="w-10 flex-none font-mono text-[0.8125rem] tabular-nums text-ink-3">{formatTime(position)}</span>
                <input
                  type="range"
                  min={0}
                  max={duration}
                  step={1}
                  value={Math.floor(position)}
                  onChange={(event) => setPosition(Number(event.target.value))}
                  aria-label="Seek"
                  aria-valuetext={`${formatTime(position)} of ${formatTime(duration)}`}
                  className="h-1 min-w-0 flex-1 cursor-pointer accent-[#38bdf8]"
                />
                <span className="w-10 flex-none text-right font-mono text-[0.8125rem] tabular-nums text-ink-3">{formatTime(duration)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-2">
                <div className="flex items-center">
                  <button type="button" onClick={() => setPlaying(!playing)} className="icon-btn" aria-label={playing ? "Pause" : "Play"}>
                    {playing ? <Pause className="h-5 w-5" strokeWidth={1.75} /> : <Play className="h-5 w-5" strokeWidth={1.75} />}
                  </button>
                  <button type="button" onClick={() => setPosition((value) => Math.max(0, value - 5))} className="icon-btn" aria-label="Back 5 seconds">
                    <RotateCcw className="h-5 w-5" strokeWidth={1.75} />
                  </button>
                  <button type="button" onClick={() => setPosition((value) => Math.min(duration, value + 5))} className="icon-btn" aria-label="Forward 5 seconds">
                    <RotateCw className="h-5 w-5" strokeWidth={1.75} />
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <label htmlFor="player-speed" className="sr-only">
                    Playback speed
                  </label>
                  <select id="player-speed" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} className="field h-9 w-[5.5rem]">
                    {SPEEDS.map((value) => (
                      <option key={value} value={value}>
                        {value}x
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setTheater(!theater)}
                    aria-pressed={theater}
                    aria-label="Theater mode"
                    className="icon-btn hidden lg:inline-flex"
                  >
                    {theater ? <Minimize2 className="h-5 w-5" strokeWidth={1.75} /> : <Maximize2 className="h-5 w-5" strokeWidth={1.75} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-start justify-between gap-6 text-sm">
            {previous ? (
              <Link to={`/lesson/${previous.id}`} className="flex min-w-0 items-center gap-1 text-ink-3 transition-colors hover:text-ink">
                <ChevronLeft className="h-4 w-4 flex-none" strokeWidth={1.75} aria-hidden="true" />
                <span className="truncate">{previous.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link to={`/lesson/${next.id}`} className="flex min-w-0 items-center gap-1 text-accent transition-colors hover:text-accent-hover">
                <span className="truncate">Next: {next.title}</span>
                <ChevronRight className="h-4 w-4 flex-none" strokeWidth={1.75} aria-hidden="true" />
              </Link>
            ) : (
              <Link to={`/quiz/${chapter.id}`} className="link link-quiz flex-none">
                Take the chapter quiz
              </Link>
            )}
          </div>
        </div>

        {!theater && (
          <aside className="lg:col-span-4" aria-labelledby="chapter-lessons-title">
            <div className="flex items-baseline justify-between gap-4">
              <h2 id="chapter-lessons-title" className="item-title">
                {chapter.title}
              </h2>
              <span className="meta flex-none tabular-nums">
                {chapterLessons.filter((item) => progress[item.id]?.status === "completed").length} of {chapterLessons.length}
              </span>
            </div>
            <ol className="rows mt-3 max-h-[24rem] overflow-y-auto">
              {chapterLessons.map((item) => {
                const isCurrent = item.id === lesson.id;
                const isDone = progress[item.id]?.status === "completed";
                return (
                  <li key={item.id}>
                    <Link
                      to={`/lesson/${item.id}`}
                      aria-current={isCurrent ? "page" : undefined}
                      className={`row-link flex items-center gap-3 px-2 py-2.5 text-sm ${isCurrent ? "bg-raised text-ink" : "text-ink-2"}`}
                    >
                      <span className="flex w-5 flex-none justify-center text-[0.8125rem] tabular-nums text-ink-3">
                        {isDone ? <Check className="h-4 w-4 text-ok" strokeWidth={2} aria-label="Completed" /> : item.orderIndex}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{item.title}</span>
                      <span className="meta flex-none tabular-nums">{item.durationMinutes} min</span>
                    </Link>
                  </li>
                );
              })}
            </ol>
            <Link to={`/quiz/${chapter.id}`} className="link link-quiz mt-4 inline-block text-sm">
              Chapter {chapter.orderIndex} quiz
            </Link>
          </aside>
        )}
      </div>

      <div className="mt-12">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Lesson material">
          {tabs.map((item) => (
            <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} onClick={() => setTab(item.id)} className="option">
              {item.label}
            </button>
          ))}
        </div>

        <div role="tabpanel" className="mt-8 lg:w-[calc((100%-2rem)*2/3)]">
          {tab === "overview" && (
            <div className="space-y-10">
              <p className="text-ink-2">{lesson.description}</p>
              <section>
                <h2 className="section-title">Learning objectives</h2>
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[0.9375rem] text-ink-2 marker:text-ink-3">
                  {lesson.learningObjectives.map((objective: string, index: number) => (
                    <li key={index}>{objective}</li>
                  ))}
                </ul>
              </section>
              {lesson.codeExample && (
                <section>
                  <div className="flex items-baseline justify-between gap-4">
                    <h2 className="section-title">Code reference</h2>
                    <button
                      type="button"
                      onClick={() => {
                        setCode(lesson.codeExample);
                        setTab("scratchpad");
                      }}
                      className="link flex-none text-sm"
                    >
                      Open in scratchpad
                    </button>
                  </div>
                  <pre className="code-block mt-3">
                    <code>{lesson.codeExample}</code>
                  </pre>
                </section>
              )}
              <section>
                <h2 className="section-title">Key takeaways</h2>
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[0.9375rem] text-ink-2 marker:text-ink-3">
                  {lesson.keyTakeaways.map((takeaway: string, index: number) => (
                    <li key={index}>{takeaway}</li>
                  ))}
                </ul>
              </section>
            </div>
          )}

          {tab === "scratchpad" && (
            <div>
              <h2 className="section-title">JavaScript scratchpad</h2>
              <p className="mt-1 text-sm text-ink-3">Test concepts right below the video without opening another tab.</p>
              <label htmlFor="scratchpad-code" className="sr-only">
                JavaScript code
              </label>
              <textarea
                id="scratchpad-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                rows={10}
                spellCheck={false}
                className="field mt-4 bg-[#080c14] font-mono text-[0.8125rem]"
              />
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button type="button" onClick={runCode} className="btn btn-primary">
                  <Play aria-hidden="true" />
                  Run code
                </button>
                <button type="button" onClick={() => setCode(starterCode)} className="btn btn-secondary">
                  Reset code
                </button>
              </div>
              <h3 className="meta mt-6">Console output</h3>
              <pre className="code-block mt-2 min-h-16 whitespace-pre-wrap" aria-live="polite">
                {output}
              </pre>
            </div>
          )}

          {tab === "notes" && (
            <div>
              <form onSubmit={submitNote} noValidate>
                <label htmlFor="note-draft" className="field-label">
                  New note at {formatTime(position)}
                </label>
                <textarea
                  id="note-draft"
                  value={noteDraft}
                  onChange={(event) => {
                    setNoteDraft(event.target.value);
                    setNoteError("");
                  }}
                  rows={3}
                  aria-invalid={noteError ? true : undefined}
                  aria-describedby={noteError ? "note-error" : "note-hint"}
                  className="field"
                />
                {noteError ? (
                  <p id="note-error" className="field-error">
                    {noteError}
                  </p>
                ) : (
                  <p id="note-hint" className="meta mt-1.5">
                    Notes are saved with the video timestamp.
                  </p>
                )}
                <button type="submit" className="btn btn-primary mt-3">
                  Save note
                </button>
              </form>
              <h2 className="section-title mt-10">Saved notes</h2>
              {lessonNotes.length === 0 ? (
                <p className="mt-3 text-sm text-ink-3">No notes saved yet for this lesson.</p>
              ) : (
                <ul className="rows mt-3">
                  {lessonNotes.map((note: any) => (
                    <li key={note.id} className="flex items-start gap-3 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-[0.9375rem] text-ink-2">{note.content}</p>
                        <p className="meta mt-1">
                          <button type="button" onClick={() => setPosition(note.timestampSeconds)} className="link">
                            Jump to {formatTime(note.timestampSeconds)}
                          </button>
                          , {note.createdAt}
                        </p>
                      </div>
                      <button type="button" onClick={() => deleteNote(note.id)} className="icon-btn" aria-label="Delete note">
                        <Trash2 className="h-[1.125rem] w-[1.125rem]" strokeWidth={1.75} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {tab === "discussion" && (
            <div>
              <form onSubmit={submitQuestion} noValidate>
                <label htmlFor="question-draft" className="field-label">
                  Ask a question or share feedback
                </label>
                <textarea
                  id="question-draft"
                  value={questionDraft}
                  onChange={(event) => {
                    setQuestionDraft(event.target.value);
                    setQuestionError("");
                  }}
                  rows={3}
                  aria-invalid={questionError ? true : undefined}
                  aria-describedby={questionError ? "question-error" : undefined}
                  className="field"
                />
                {questionError && (
                  <p id="question-error" className="field-error">
                    {questionError}
                  </p>
                )}
                <button type="submit" className="btn btn-primary mt-3">
                  Post question
                </button>
              </form>
              {lessonDiscussions.length === 0 ? (
                <p className="mt-10 text-sm text-ink-3">No questions yet for this lesson.</p>
              ) : (
                <ul className="rows mt-10">
                  {lessonDiscussions.map((discussion: any) => (
                    <li key={discussion.id} className="py-5">
                      <div className="flex items-start gap-3">
                        <Avatar name={discussion.userName} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm">
                            <span className="font-semibold text-ink">{discussion.userName}</span>
                            <span className="meta">
                              {discussion.userRole === "admin" && <span className="font-medium text-admin">, instructor</span>}, {discussion.createdAt}
                            </span>
                          </p>
                          <p className="mt-1 text-[0.9375rem] text-ink-2">{discussion.content}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => upvoteDiscussion(discussion.id)}
                          aria-pressed={!!discussion.hasUpvoted}
                          aria-label={`Upvote, ${discussion.upvotes} so far`}
                          className={`btn btn-secondary btn-sm w-[4.5rem] flex-none tabular-nums ${discussion.hasUpvoted ? "border-accent" : ""}`}
                        >
                          <ThumbsUp aria-hidden="true" />
                          {discussion.upvotes}
                        </button>
                      </div>
                      <div className="ml-11">
                        {discussion.replies.length > 0 && (
                          <ul className="mt-4 space-y-3 border-l border-line-strong pl-4">
                            {discussion.replies.map((reply: any) => (
                              <li key={reply.id}>
                                <p className="text-sm">
                                  <span className="font-semibold text-ink">{reply.userName}</span>
                                  <span className="meta">
                                    {reply.userRole === "admin" && <span className="font-medium text-admin">, instructor</span>}, {reply.createdAt}
                                  </span>
                                </p>
                                <p className="mt-0.5 text-[0.9375rem] text-ink-2">{reply.content}</p>
                              </li>
                            ))}
                          </ul>
                        )}
                        {replyTo === discussion.id ? (
                          <form onSubmit={(event) => submitReply(event, discussion.id)} noValidate className="mt-4">
                            <label htmlFor={`reply-${discussion.id}`} className="sr-only">
                              Reply to {discussion.userName}
                            </label>
                            <input
                              id={`reply-${discussion.id}`}
                              type="text"
                              value={replyDraft}
                              onChange={(event) => {
                                setReplyDraft(event.target.value);
                                setReplyError("");
                              }}
                              placeholder="Write a reply"
                              aria-invalid={replyError ? true : undefined}
                              className="field"
                              autoFocus
                            />
                            {replyError && <p className="field-error">{replyError}</p>}
                            <div className="mt-3 flex items-center gap-3">
                              <button type="submit" className="btn btn-primary btn-sm">
                                Send reply
                              </button>
                              <button type="button" onClick={() => setReplyTo(null)} className="btn btn-secondary btn-sm">
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setReplyTo(discussion.id);
                              setReplyDraft("");
                              setReplyError("");
                            }}
                            className="link mt-3 text-sm"
                          >
                            Reply
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {tab === "transcript" && (
            <div>
              <p className="text-sm text-ink-3">Select a line to jump the video to that sentence.</p>
              <ol className="rows mt-4">
                {lesson.transcript.map((item: any, index: number) => (
                  <li key={index}>
                    <button
                      type="button"
                      onClick={() => setPosition(item.timeSeconds)}
                      aria-current={item === caption ? "true" : undefined}
                      className={`row-link flex w-full items-baseline gap-4 px-2 py-3 text-left text-[0.9375rem] ${item === caption ? "text-ink" : "text-ink-2"}`}
                    >
                      <span className="w-10 flex-none font-mono text-[0.8125rem] tabular-nums text-accent">{formatTime(item.timeSeconds)}</span>
                      <span>{item.text}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>

      {shortcutsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) setShortcutsOpen(false);
          }}
        >
          <div role="dialog" aria-modal="true" aria-labelledby="shortcuts-title" className="surface w-full max-w-sm p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 id="shortcuts-title" className="section-title">
                Keyboard shortcuts
              </h2>
              <button ref={closeShortcutsRef} type="button" onClick={() => setShortcutsOpen(false)} className="icon-btn -mr-2" aria-label="Close">
                <X className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </div>
            <dl className="rows mt-4 text-sm">
              {SHORTCUTS.map(([action, keys]) => (
                <div key={action} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-ink-2">{action}</dt>
                  <dd className="font-mono text-[0.8125rem] text-ink-3">{keys}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </div>
  );
};
