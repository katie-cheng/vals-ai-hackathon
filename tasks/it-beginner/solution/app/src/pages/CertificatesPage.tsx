import { Link } from "react-router-dom";
import { Check, Lock } from "lucide-react";
import { CHAPTERS } from "../data/chapters";
import { useCourse } from "../context/CourseContext";

export const CertificatesPage = () => {
  const { certificates, getChapterProgressPercent, quizAttempts } = useCourse();
  return (
    <div className="container-page page">
      <h1 className="page-title">Certificates</h1>
      <p className="lead mt-2">
        A certificate is awarded when you complete every lesson in a chapter or pass its quiz. Each one has a
        verification code and a print layout.
      </p>

      <section className="mt-12" aria-labelledby="earned-title">
        <h2 id="earned-title" className="section-title">
          Earned certificates
        </h2>
        {certificates.length === 0 ? (
          <p className="mt-3 text-sm text-ink-3">
            None yet. Complete all lessons in a chapter or score 66% or more on its quiz to earn your first.
          </p>
        ) : (
          <ul className="rows mt-4">
            {certificates.map((certificate: any) => (
              <li key={certificate.id}>
                <Link
                  to={`/certificate/${certificate.certificateCode}`}
                  className="row-link grid grid-cols-1 gap-x-8 gap-y-1 py-4 sm:grid-cols-12 sm:items-baseline"
                >
                  <span className="item-title sm:col-span-6">{certificate.chapterTitle}</span>
                  <span className="meta sm:col-span-3">Issued {certificate.issuedAt}</span>
                  <span className="font-mono text-[0.8125rem] text-quiz sm:col-span-3 sm:text-right">
                    {certificate.certificateCode}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-14" aria-labelledby="progress-title">
        <h2 id="progress-title" className="section-title">
          Progress by chapter
        </h2>
        <ul className="rows mt-4">
          {CHAPTERS.map((chapter) => {
            const percent = getChapterProgressPercent(chapter.id);
            const quizPassed = quizAttempts[chapter.id]?.passed;
            const earned = certificates.some((certificate: any) => certificate.chapterId === chapter.id);
            return (
              <li key={chapter.id} className="grid grid-cols-1 gap-x-8 gap-y-2 py-4 lg:grid-cols-12 lg:items-center">
                <div className="min-w-0 lg:col-span-5">
                  <h3 className="item-title">{chapter.title}</h3>
                  <p className="meta">Chapter {chapter.orderIndex}</p>
                </div>
                <div className="flex items-center gap-3 lg:col-span-4">
                  <div className={`progress flex-1 ${percent === 100 ? "progress-done" : ""}`}>
                    <span style={{ width: `${percent}%` }} />
                  </div>
                  <span className="meta flex-none">
                    Lessons {percent}%, quiz {quizPassed ? "passed" : "pending"}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm lg:col-span-3 lg:justify-end">
                  <span className={`badge ${earned ? "badge-ok" : ""}`}>
                    {earned ? <Check aria-hidden="true" /> : <Lock aria-hidden="true" />}
                    {earned ? "Earned" : "Locked"}
                  </span>
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
  );
};
