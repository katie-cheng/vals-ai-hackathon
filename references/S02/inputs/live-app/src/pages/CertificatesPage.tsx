import { Link } from "react-router-dom";
import { ArrowRight, Award, CircleCheck, Lock, Sparkles } from "lucide-react";
import { CHAPTERS } from "../data/chapters";
import { useCourse } from "../context/CourseContext";

export const CertificatesPage = () => {
  const { certificates, getChapterProgressPercent, quizAttempts } = useCourse();
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="pb-4 border-b border-slate-800 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
            Verifiable Credentials
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Gold Seal Accreditation
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          {"Student Certificates & Credentials"}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Verifiable certificates are awarded upon completing 100% of chapter lessons or passing chapter
          assessments. Share your credentials online or print official PDF copies.
        </p>
      </div>
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          <span>Your Earned Certificates ({certificates.length})</span>
        </h2>
        {certificates.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <p className="text-sm font-bold text-white">No certificates unlocked yet</p>
            <p className="text-xs text-slate-400">
              Complete all lessons in a chapter or score 66%+ on the chapter quiz to unlock your first
              credential!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((certificate) => (
              <div
                key={certificate.id}
                className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-amber-500/30 p-6 flex flex-col justify-between space-y-4 shadow-2xl relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full pointer-events-none" />
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 font-mono">
                      {certificate.certificateCode}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Verified
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base text-white">{certificate.chapterTitle}</h3>
                  <p className="text-xs text-slate-300">
                    Awarded to <strong className="text-white">{certificate.userName}</strong> for successful
                    curriculum mastery.
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">Issued: {certificate.issuedAt}</p>
                </div>
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <Link
                    to={`/certificate/${certificate.certificateCode}`}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
                  >
                    <span>View Official Certificate</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <span className="text-[10px] text-slate-400 font-mono">AjinLab Accredited</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="space-y-4 pt-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-sky-400" />
          <span>Curriculum Certificate Progress</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CHAPTERS.map((chapter) => {
            const p = getChapterProgressPercent(chapter.id);
            const h = quizAttempts[chapter.id]?.passed;
            const v = certificates.some((certificate) => certificate.chapterId === chapter.id);
            return (
              <div key={chapter.id} className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{chapter.icon}</span>
                    <span className="font-bold text-sm text-white">Chapter {chapter.orderIndex}</span>
                  </div>
                  {v ? (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <CircleCheck className="w-3.5 h-3.5" />
                      <span>Unlocked</span>
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Locked</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">{chapter.title}</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Lessons: {p}%</span>
                    <span>Quiz: {h ? "Passed ✓" : "Pending"}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div
                      className="bg-sky-500 h-1.5 rounded-full"
                      style={{
                        width: `${p}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="pt-2 flex justify-between items-center text-xs">
                  <Link to={`/courses#chapter-${chapter.id}`} className="text-sky-400 hover:underline">
                    View Chapter
                  </Link>
                  <Link to={`/quiz/${chapter.id}`} className="text-amber-400 hover:underline">
                    Take Quiz
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
