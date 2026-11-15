import * as React from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Play } from "lucide-react";
import { CHAPTERS } from "../data/chapters";
import { LESSONS } from "../data/lessons";
import { useCourse } from "../context/CourseContext";

const K = ({ children }: { children: React.ReactNode }) => <span className="text-indigo">{children}</span>;
const V = ({ children }: { children: React.ReactNode }) => <span className="text-accent-hover">{children}</span>;
const S = ({ children }: { children: React.ReactNode }) => <span className="text-[#fcd34d]">{children}</span>;
const B = ({ children }: { children: React.ReactNode }) => <span className="text-admin">{children}</span>;
const Scratchpad = () => (
  <pre className="overflow-x-auto px-4 py-4 font-mono text-[0.8125rem] leading-6 text-ink-2">
    <span className="text-ink-3">{"// Chapter 3: Web Development Fundamentals"}</span>
    {"\n"}
    <K>const</K> <V>platform</V> = <S>"IT Beginner"</S>;{"\n"}
    <K>const</K> <V>curriculum</V> {"= {"}
    {"\n"}
    {"  lessons: "}
    <span className="text-ok">42</span>,{"\n"}
    {"  framework: "}
    <S>"Vue.js + REST APIs"</S>,{"\n"}
    {"  hasQuizzes: "}
    <B>true</B>,{"\n"}
    {"  printableCertificate: "}
    <B>true</B>
    {"\n};\n"}
    console.log(<S>"Ready to learn full-stack web tech!"</S>);
  </pre>
);

const FEATURES = [
  {
    title: "Video player",
    colour: "text-accent",
    body: "Resumes from your exact second, plays at 1.25x, 1.5x or 2x, and has keyboard shortcuts and transcript jump links.",
  },
  {
    title: "In-browser code sandbox",
    colour: "text-indigo",
    body: "Tabbed editor for HTML, CSS and JavaScript with a sandboxed preview, console capture and 4 practice presets saved in your browser.",
  },
  {
    title: "Chapter quizzes",
    colour: "text-ok",
    body: "Instant feedback and an explanation for every answer. Passing a quiz issues the chapter certificate.",
  },
  {
    title: "Certificates",
    colour: "text-quiz",
    body: "Each certificate has a unique verification code and a print layout for LinkedIn or your portfolio.",
  },
  {
    title: "Q&A and notes",
    colour: "text-admin",
    body: "Ask lesson-specific questions, upvote answers, and keep timestamped notes that jump the video back to that second.",
  },
  {
    title: "Cheatsheets and handbooks",
    colour: "text-bad",
    body: "Syntax references for JavaScript ES6+, HTML5, the CSS box model and Flexbox, Agile and Scrum, and the command line and NPM.",
  },
];

export const LandingPage = () => {
  const { lastResumeLessonId } = useCourse();
  const [openChapter, setOpenChapter] = React.useState<number | null>(1);
  const [output, setOutput] = React.useState("");

  return (
    <div className="pb-20">
      <section className="container-page grid grid-cols-1 items-center gap-12 pt-14 lg:grid-cols-12 lg:gap-8 lg:pt-20">
        <div className="lg:col-span-6">
          <h1 className="display text-4xl leading-[1.1] text-ink sm:text-5xl">
            Master full-stack web development from zero to production
          </h1>
          <p className="lead mt-5 text-lg">
            The AjinLab IT Beginner curriculum: 42 video lessons across 6 chapters, with an in-browser code
            sandbox, chapter quizzes and printable certificates of completion. Free and open source.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Link to={`/lesson/${lastResumeLessonId}`} className="btn btn-primary">
              <Play aria-hidden="true" />
              Resume lesson {lastResumeLessonId}
            </Link>
            <Link to="/playground" className="link text-sm">
              Open the code sandbox
            </Link>
          </div>
        </div>
        <div className="min-w-0 lg:col-span-6 lg:pl-8">
          <div className="surface overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
              <span className="font-mono text-[0.8125rem] text-ink-3">in-lesson-scratchpad.js</span>
              <button type="button" onClick={() => setOutput("Ready to learn full-stack web tech!")} className="btn btn-secondary btn-sm">
                <Play aria-hidden="true" />
                Run
              </button>
            </div>
            <Scratchpad />
            <div
              aria-live="polite"
              className="min-h-11 border-t border-line px-4 py-2.5 font-mono text-[0.8125rem] text-ink-3"
            >
              {output ? <span className="fade-in text-ok">{output}</span> : "Press Run to see the console output"}
            </div>
          </div>
        </div>
      </section>

      <section className="container-page mt-24">
        <h2 className="max-w-2xl display text-3xl text-ink">
          Everything you need to master modern software development
        </h2>
        <p className="lead mt-3">Every lesson is integrated with active learning tools.</p>
        <dl className="mt-10 grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="border-t border-line py-6">
              <dt className={`item-title ${feature.colour}`}>{feature.title}</dt>
              <dd className="mt-2 text-sm text-ink-3">{feature.body}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="container-page mt-20 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-24">
            <h2 className="display text-3xl text-ink">Curriculum</h2>
            <p className="lead mt-3">
              Six chapters take you from setting up your tools to a full-stack application. Open a chapter to see
              its lessons.
            </p>
            <Link to="/courses" className="link mt-5 inline-block text-sm">
              View the full catalog
            </Link>
          </div>
        </div>
        <div className="rows lg:col-span-8">
          {CHAPTERS.map((chapter) => {
            const isOpen = openChapter === chapter.id;
            const lessons = LESSONS.filter((lesson) => lesson.chapterId === chapter.id);
            return (
              <div key={chapter.id}>
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpenChapter(isOpen ? null : chapter.id)}
                    aria-expanded={isOpen}
                    aria-controls={`chapter-panel-${chapter.id}`}
                    className="row-link flex w-full items-center justify-between gap-4 py-4 text-left"
                  >
                    <span className="min-w-0">
                      <span className="item-title block">{chapter.title}</span>
                      <span className="meta block">
                        Chapter {chapter.orderIndex}, {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"},{" "}
                        {chapter.estimatedHours}
                      </span>
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 flex-none text-ink-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                  </button>
                </h3>
                {isOpen && (
                  <div id={`chapter-panel-${chapter.id}`} className="fade-in pb-6">
                    <p className="text-sm text-ink-2">{chapter.description}</p>
                    <p className="meta mt-1">Covers {chapter.keyConcepts.join(", ").toLowerCase()}.</p>
                    <ol className="mt-4 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                      {lessons.map((lesson) => (
                        <li key={lesson.id}>
                          <Link
                            to={`/lesson/${lesson.id}`}
                            className="flex items-baseline justify-between gap-4 py-1.5 text-sm text-ink-2 transition-colors hover:text-accent"
                          >
                            <span className="min-w-0 truncate">{lesson.title}</span>
                            <span className="meta flex-none tabular-nums">{lesson.durationMinutes} min</span>
                          </Link>
                        </li>
                      ))}
                    </ol>
                    <Link to={`/quiz/${chapter.id}`} className="link link-quiz mt-4 inline-block text-sm">
                      Take the chapter {chapter.id} quiz
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="container-page mt-24">
        <div className="border-t border-line pt-12">
          <h2 className="max-w-xl display text-3xl text-ink">
            Ready to code your first web application?
          </h2>
          <p className="lead mt-3">Progress, notes, code snippets and certificates are saved in your browser.</p>
          <Link to="/lesson/1" className="btn btn-primary mt-7">
            Start from lesson 1
          </Link>
        </div>
      </section>
    </div>
  );
};
