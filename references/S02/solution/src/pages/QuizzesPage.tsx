import { Link } from "react-router-dom";
import { Award, CircleQuestionMark } from "lucide-react";
import { CHAPTERS } from "../data/chapters";
import { QUIZ_QUESTIONS } from "../data/quizzes";
import { useCourse } from "../context/CourseContext";

export const QuizzesPage = () => {
  const { quizAttempts } = useCourse();
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="pb-4 border-b border-slate-800 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
            Knowledge Assessments
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            6 Chapter Quizzes
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Interactive Chapter Quizzes</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Test your technical understanding after completing each chapter. Earn over 66% to pass, inspect
          detailed explanations, and qualify for verifiable certificates.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CHAPTERS.map((chapter) => {
          const f = QUIZ_QUESTIONS.filter((question) => question.chapterId === chapter.id);
          const i = quizAttempts[chapter.id];
          return (
            <div
              key={chapter.id}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 shadow-xl"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{chapter.icon}</span>
                    <span className="text-xs font-bold text-sky-400">Chapter {chapter.orderIndex}</span>
                  </div>
                  {i ? (
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${i.passed ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/10 text-rose-400 border border-rose-500/30"}`}
                    >
                      {i.passed ? "✓ Passed" : "Needs Review"} ({i.percentage}%)
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 font-mono">Not attempted</span>
                  )}
                </div>
                <h3 className="font-bold text-base text-white">{chapter.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{chapter.description}</p>
                <div className="text-xs text-slate-400 flex items-center gap-2 pt-1 font-mono">
                  <span>{f.length} Assessment Questions</span>
                  <span>•</span>
                  <span>Passing score: 66%</span>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <Link
                  to={`/quiz/${chapter.id}`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
                >
                  <CircleQuestionMark className="w-3.5 h-3.5" />
                  <span>{i ? "Retake Quiz" : "Start Assessment"}</span>
                </Link>
                {i?.passed && (
                  <Link
                    to={`/certificate/ITB-CH${chapter.id}-PASS`}
                    className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>View Credential</span>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
