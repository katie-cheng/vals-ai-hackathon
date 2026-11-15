import * as React from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { CHAPTERS } from "../data/chapters";
import { QUIZ_QUESTIONS } from "../data/quizzes";
import { useCourse } from "../context/CourseContext";

type Result = { score: number; total: number; percentage: number; passed: boolean };

export const QuizDetailPage = () => {
  const { chapterId } = useParams();
  const id = parseInt(chapterId || "1", 10);
  const { submitQuiz, claimCertificate, certificates } = useCourse();
  const certificate: any = certificates.find((item: any) => item.chapterId === id);
  const chapter = CHAPTERS.find((item) => item.id === id) || CHAPTERS[0];
  const questions = QUIZ_QUESTIONS.filter((question) => question.chapterId === id);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [result, setResult] = React.useState<Result | null>(null);
  const [showMissing, setShowMissing] = React.useState(false);
  const resultRef = React.useRef<HTMLDivElement>(null);
  const submitted = result !== null;
  const answered = Object.keys(answers).length;

  const choose = (questionId: string | number, option: string) => {
    if (!submitted) setAnswers((current) => ({ ...current, [questionId]: option }));
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (answered < questions.length) {
      setShowMissing(true);
      const first = questions.find((question) => !answers[question.id]);
      if (first) document.getElementById(`question-${first.id}`)?.scrollIntoView({ block: "center" });
      return;
    }
    const outcome = submitQuiz(id, answers);
    setResult({ score: outcome.score, total: outcome.totalQuestions, percentage: outcome.percentage, passed: outcome.passed });
    if (outcome.passed) claimCertificate(id, chapter.title, "chapter");
    requestAnimationFrame(() => resultRef.current?.scrollIntoView({ block: "start" }));
  };

  const reset = () => {
    setAnswers({});
    setResult(null);
    setShowMissing(false);
    window.scrollTo(0, 0);
  };

  return (
    <div className="container-page page">
      <div className="mx-auto max-w-3xl">
        <Link to="/quizzes" className="inline-flex items-center gap-1 text-sm text-ink-3 transition-colors hover:text-ink">
          <ChevronLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          All quizzes
        </Link>
        <h1 className="page-title mt-4">{chapter.title} quiz</h1>
        <p className="lead mt-2">
          Chapter {chapter.orderIndex}, {questions.length} questions, 66% to pass. Answer every question; the
          explanations appear after you submit.
        </p>

        {result && (
          <div
            ref={resultRef}
            role="status"
            className={`surface mt-8 scroll-mt-24 p-5 ${result.passed ? "border-ok/50" : "border-warn/50"}`}
          >
            <h2 className="section-title">{result.passed ? "Quiz passed" : "Review recommended"}</h2>
            <p className="mt-1 text-sm text-ink-2">
              You scored {result.score} of {result.total} ({result.percentage}%).
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {result.passed && certificate && (
                <Link to={`/certificate/${certificate.certificateCode}`} className="btn btn-primary">
                  View certificate
                </Link>
              )}
              <button type="button" onClick={reset} className="btn btn-secondary">
                Retake quiz
              </button>
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} noValidate className="mt-10">
          <ol className="space-y-10">
            {questions.map((question: any, index) => {
              const selected = answers[question.id];
              const correct = selected === question.correctOption;
              const missing = showMissing && !selected;
              return (
                <li key={question.id} id={`question-${question.id}`}>
                  <fieldset aria-describedby={missing ? `question-${question.id}-error` : undefined}>
                    <legend className="item-title flex w-full items-start justify-between gap-4">
                      <span>
                        {index + 1}. {question.question}
                      </span>
                      {submitted && (
                        <span className={`badge flex-none ${correct ? "badge-ok" : "badge-warn"}`}>
                          {correct ? "Correct" : "Incorrect"}
                        </span>
                      )}
                    </legend>
                    <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2" role="radiogroup" aria-label={`Question ${index + 1}`}>
                      {["A", "B", "C", "D"].map((letter) => {
                        const isSelected = selected === letter;
                        const isAnswer = question.correctOption === letter;
                        let state = "border-line text-ink-2 hover:border-line-strong";
                        if (submitted && isAnswer) state = "border-ok bg-ok/10 text-ink";
                        else if (submitted && isSelected) state = "border-bad bg-bad/10 text-ink";
                        else if (!submitted && isSelected) state = "border-accent bg-accent/15 text-ink";
                        return (
                          <button
                            key={letter}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            disabled={submitted}
                            onClick={() => choose(question.id, letter)}
                            className={`flex min-h-11 items-start gap-3 rounded-md border px-3 py-2.5 text-left text-sm transition-colors ${state}`}
                          >
                            <span className="w-4 flex-none font-mono text-ink-3">{letter}</span>
                            <span>{question[`option${letter}`]}</span>
                          </button>
                        );
                      })}
                    </div>
                    {missing && (
                      <p id={`question-${question.id}-error`} className="field-error">
                        Choose an answer for this question.
                      </p>
                    )}
                    {submitted && <p className="mt-4 border-l-2 border-line-strong pl-4 text-sm text-ink-2">{question.explanation}</p>}
                  </fieldset>
                </li>
              );
            })}
          </ol>
          <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-line pt-6">
            {submitted ? (
              <button type="button" onClick={reset} className="btn btn-secondary">
                Retake quiz
              </button>
            ) : (
              <button type="submit" className="btn btn-primary">
                Submit quiz
              </button>
            )}
            <span className="meta" aria-live="polite">
              {answered} of {questions.length} answered
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};
