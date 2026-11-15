import * as React from "react";
import confetti from "canvas-confetti";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Award, ChevronLeft, CircleCheck, CircleX, RotateCcw } from "lucide-react";
import { CHAPTERS } from "../data/chapters";
import { QUIZ_QUESTIONS } from "../data/quizzes";
import { useCourse } from "../context/CourseContext";

export const QuizDetailPage = () => {
  const { chapterId } = useParams();
  useNavigate();
  const d = parseInt(chapterId || "1", 10);
  const { submitQuiz, claimCertificate, quizAttempts } = useCourse();
  const h = CHAPTERS.find((chapter) => chapter.id === d) || CHAPTERS[0];
  const v = QUIZ_QUESTIONS.filter((question) => question.chapterId === d);
  const [T, S] = React.useState({});
  const [M, b] = React.useState(false);
  const [x, _] = React.useState(null);
  const R = ($, te) => {
    if (!M) {
      S((me) => ({
        ...me,
        [$]: te,
      }));
    }
  };
  const U = (event) => {
    event.preventDefault();
    const te = submitQuiz(d, T);
    _({
      score: te.score,
      total: te.totalQuestions,
      percentage: te.percentage,
      passed: te.passed,
    });
    b(true);
    if (te.passed) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: {
          y: 0.6,
        },
      });
      claimCertificate(d, h.title, "chapter");
    }
  };
  const V = () => {
    S({});
    b(false);
    _(null);
  };
  const k = Object.keys(T).length;
  const F = k === v.length;
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <Link to="/quizzes" className="flex items-center gap-1 hover:text-white transition-colors">
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Quizzes</span>
        </Link>
        <span className="font-mono">{v.length} Questions</span>
      </div>
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{h.icon}</span>
          <div>
            <span className="text-xs font-bold text-sky-400">Chapter {h.orderIndex} Assessment</span>
            <h1 className="text-2xl font-black text-white">{h.title} Quiz</h1>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Answer all questions below. Immediate feedback and detailed explanations will be provided after
          submission.
        </p>
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
          <span>
            Answered:{" "}
            <strong>
              {k} / {v.length}
            </strong>
          </span>
          <span>
            Passing mark: <strong>66%</strong>
          </span>
        </div>
      </div>
      {M && x && (
        <div
          className={`p-6 rounded-2xl border space-y-4 animate-in fade-in duration-200 ${x.passed ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300" : "bg-rose-950/40 border-rose-500/40 text-rose-300"}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {x.passed ? (
                <CircleCheck className="w-6 h-6 text-emerald-400" />
              ) : (
                <CircleX className="w-6 h-6 text-rose-400" />
              )}
              <div>
                <h3 className="font-extrabold text-lg text-white">
                  {x.passed ? "🎉 Assessment Passed with Honors!" : "Review Recommended"}
                </h3>
                <p className="text-xs">
                  You scored{" "}
                  <strong className="text-white">
                    {x.score} / {x.total}
                  </strong>{" "}
                  ({x.percentage}%).
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={V}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>
              {x.passed && (
                <Link
                  to={`/certificate/ITB-CH${d}-CERT`}
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Claim Certificate</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
      <form onSubmit={U} className="space-y-6">
        {v.map(($, index) => {
          const me = T[$.id];
          const ue = me === $.correctOption;
          return (
            <div
              key={$.id}
              className={`p-6 rounded-2xl bg-slate-900 border transition-all space-y-4 ${M ? (ue ? "border-emerald-500/40" : "border-rose-500/40") : "border-slate-800"}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-sky-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <h3 className="font-bold text-sm sm:text-base text-white leading-snug">{$.question}</h3>
                </div>
                {M && (
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded shrink-0 ${ue ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}
                  >
                    {ue ? "✓ Correct" : "✗ Incorrect"}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {["A", "B", "C", "D"].map((be) => {
                  const ne = $[`option${be}`];
                  const pe = me === be;
                  const Be = $.correctOption === be;
                  let re = "bg-slate-850 hover:bg-slate-800 border-slate-800 text-slate-300";
                  if (M) {
                    if (Be) {
                      re = "bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold";
                    } else {
                      if (pe && !ue) {
                        re = "bg-rose-950/60 border-rose-500 text-rose-200";
                      }
                    }
                  } else {
                    if (pe) {
                      re = "bg-sky-500/20 border-sky-500 text-sky-300 font-bold";
                    }
                  }
                  return (
                    <button
                      key={be}
                      type="button"
                      onClick={() => R($.id, be)}
                      className={`p-3 rounded-xl border text-left text-xs transition-all flex items-start gap-2.5 ${re}`}
                    >
                      <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-200 font-bold text-[10px] flex items-center justify-center shrink-0">
                        {be}
                      </span>
                      <span className="leading-relaxed">{ne}</span>
                    </button>
                  );
                })}
              </div>
              {M && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <span className="font-bold text-sky-400 block font-mono text-[11px]">Explanation:</span>
                  <p className="leading-relaxed">{$.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
        <div className="pt-2 flex items-center justify-between">
          <Link to="/quizzes" className="text-xs text-slate-400 hover:text-white">
            ← Cancel Assessment
          </Link>
          {M ? (
            <button
              type="button"
              onClick={V}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all"
            >
              {"Reset & Retake Quiz"}
            </button>
          ) : (
            <button
              type="submit"
              disabled={!F}
              className={`px-6 py-3 rounded-xl font-bold text-xs transition-all shadow-xl ${F ? "bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-amber-500/20" : "bg-slate-800 text-slate-400 cursor-not-allowed"}`}
            >
              {F ? "Submit Quiz Assessment" : `Answer all questions (${k}/${v.length})`}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
