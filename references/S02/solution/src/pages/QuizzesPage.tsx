import { Link } from "react-router-dom";
import { CHAPTERS } from "../data/chapters";
import { QUIZ_QUESTIONS } from "../data/quizzes";
import { useCourse } from "../context/CourseContext";

export const QuizzesPage = () => {
  const { quizAttempts } = useCourse();
  return (
    <div className="container-page page">
      <h1 className="page-title">Chapter quizzes</h1>
      <p className="lead mt-2">
        One quiz per chapter. Score 66% or more to pass, read the explanation for every answer, and qualify for
        the chapter certificate.
      </p>
      <ul className="rows mt-10">
        {CHAPTERS.map((chapter) => {
          const questions = QUIZ_QUESTIONS.filter((question) => question.chapterId === chapter.id);
          const attempt = quizAttempts[chapter.id];
          return (
            <li key={chapter.id} className="grid grid-cols-1 gap-x-8 gap-y-4 py-6 lg:grid-cols-12 lg:items-center">
              <div className="min-w-0 lg:col-span-7">
                <h2 className="item-title">{chapter.title}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-ink-3">{chapter.description}</p>
              </div>
              <p className="meta lg:col-span-2">
                Chapter {chapter.orderIndex}
                <br />
                {questions.length} questions
              </p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3 lg:col-span-3 lg:justify-end">
                {attempt && (
                  <span className={`badge ${attempt.passed ? "badge-ok" : "badge-warn"}`}>
                    {attempt.passed ? "Passed" : "Needs review"}, {attempt.percentage}%
                  </span>
                )}
                {attempt?.passed && (
                  <Link to={`/certificate/ITB-CH${chapter.id}-PASS`} className="link text-sm">
                    Certificate
                  </Link>
                )}
                <Link to={`/quiz/${chapter.id}`} className="btn btn-secondary" aria-label={`${attempt ? "Retake" : "Start"} the chapter ${chapter.orderIndex} quiz`}>
                  {attempt ? "Retake quiz" : "Start quiz"}
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
