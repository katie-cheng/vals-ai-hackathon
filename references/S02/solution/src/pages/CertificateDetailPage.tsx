import { Link, useParams } from "react-router-dom";
import { Award, ChevronLeft, GraduationCap, Printer, ShieldCheck } from "lucide-react";
import { useCourse } from "../context/CourseContext";

export const CertificateDetailPage = () => {
  const { code } = useParams();
  const { currentUser, certificates } = useCourse();
  const i = certificates.find((certificate) => certificate.certificateCode === code);
  const p = i ? i.userName : currentUser.fullName;
  const h = i ? i.chapterTitle : "Full-Stack Web Development & Engineering";
  const v = code || "ITB-CH1-8291X";
  const T = i ? i.issuedAt : "November 6, 2026";
  const S = () => {
    window.print();
  };
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="no-print flex items-center justify-between text-xs text-slate-400">
        <Link to="/certificates" className="flex items-center gap-1 hover:text-white transition-colors">
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Credentials Gallery</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={S}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>
      <div className="cert-print-container relative rounded-3xl bg-[#0f1123] border-[10px] border-double border-[#00d2ff] p-8 sm:p-14 text-center shadow-2xl overflow-hidden space-y-8">
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-20 pointer-events-none" />
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-400 to-indigo-600 flex items-center justify-center text-white shadow-lg">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-xl tracking-wider text-[#00d2ff] uppercase font-['Cinzel']">
              AjinLab Education
            </span>
          </div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400 font-semibold font-['Cinzel']">
            Certificate of Curriculum Completion
          </p>
        </div>
        <div className="space-y-4 max-w-2xl mx-auto">
          <p className="text-sm text-slate-400 italic">This is to certify that</p>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-wide font-['Cinzel'] border-b-2 border-[#00d2ff]/40 pb-3 inline-block px-8">
            {p}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-2">
            has successfully fulfilled all curriculum requirements, hands-on programming projects, and
            assessment milestones for
          </p>
          <h3 className="text-xl sm:text-2xl font-black text-[#00d2ff] font-['Cinzel']">{h}</h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xl mx-auto">
            Covering modern software lifecycles, Agile and Scrum, deep JavaScript ES6+, HTML5, CSS3 Flexbox
            layout, NPM tooling, Vue.js reactive single-page architecture, and client-server REST
            communication.
          </p>
        </div>
        <div className="pt-8 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center text-xs">
          <div className="text-center sm:text-left space-y-1">
            <p className="text-slate-400">Date Issued:</p>
            <p className="font-bold text-white font-mono">{T}</p>
            <p className="text-[11px] text-slate-400">Serial Code:</p>
            <p className="font-bold text-[#00d2ff] font-mono">{v}</p>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-full border-4 border-[#00d2ff] bg-gradient-to-tr from-sky-950 to-indigo-950 flex flex-col items-center justify-center shadow-xl shadow-[#00d2ff]/20">
              <Award className="w-8 h-8 text-amber-400" />
              <span className="text-[9px] font-black uppercase text-amber-300 tracking-wider">OFFICIAL</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-2 font-mono">Verified Credential</span>
          </div>
          <div className="text-center sm:text-right space-y-1">
            <div className="font-serif italic text-lg text-sky-300 font-bold">iAzazelOfc / AjinLab</div>
            <p className="text-xs font-bold text-white">Lead Curriculum Instructor</p>
            <p className="text-[11px] text-slate-400">IT Beginner Platform</p>
          </div>
        </div>
        <div className="pt-4 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Public Verification URL: itbeginner.com/certificate/{v}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
