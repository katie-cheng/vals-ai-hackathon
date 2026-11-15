import { Link } from "react-router-dom";
import { Award, CodeXml, Github, GraduationCap, Shield } from "lucide-react";

export const Footer = () => (
  <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs py-12 no-print">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-base text-white">IT Beginner</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Production-grade educational learning platform reconstructed for the{" "}
            <strong>AjinLab IT Beginner</strong> curriculum. 42 lessons, in-browser code sandbox, interactive
            quizzes, and verifiable credentials.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Full-Stack Modern SPA | React 19 + TypeScript</span>
          </div>
        </div>
        <div>
          <h4 className="font-bold text-slate-200 mb-3 text-sm">Course Curriculum</h4>
          <ul className="space-y-1.5">
            <li>
              <Link to="/courses" className="hover:text-sky-400 transition-colors">
                Ch 1: 🚀 Getting Started (3 Lessons)
              </Link>
            </li>
            <li>
              <Link to="/courses" className="hover:text-sky-400 transition-colors">
                Ch 2: ⚙️ Software Development Basics (3 Lessons)
              </Link>
            </li>
            <li>
              <Link to="/courses" className="hover:text-sky-400 transition-colors">
                Ch 3: 🌐 Web Dev Fundamentals (16 Lessons)
              </Link>
            </li>
            <li>
              <Link to="/courses" className="hover:text-sky-400 transition-colors">
                {"Ch 4: 🛠️ Frontend Development & Tools (14 Lessons)"}
              </Link>
            </li>
            <li>
              <Link to="/courses" className="hover:text-sky-400 transition-colors">
                {"Ch 5: ⚡ Vue.js Framework & Reactive Apps (5 Lessons)"}
              </Link>
            </li>
            <li>
              <Link to="/courses" className="hover:text-sky-400 transition-colors">
                Ch 6: 🔌 Full-Stack Architecture (1 Lesson)
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-slate-200 mb-3 text-sm">Developer Tools</h4>
          <ul className="space-y-1.5">
            <li>
              <Link
                to="/playground"
                className="hover:text-sky-400 transition-colors flex items-center gap-1.5"
              >
                <CodeXml className="w-3.5 h-3.5 text-sky-400" />
                {"Live Code Playground & Sandbox"}
              </Link>
            </li>
            <li>
              <Link to="/resources#javascript" className="hover:text-sky-400 transition-colors">
                ⚡ JavaScript Handbook
              </Link>
            </li>
            <li>
              <Link to="/resources#html-css" className="hover:text-sky-400 transition-colors">
                {"🌐 HTML5 & CSS3 Flexbox Reference"}
              </Link>
            </li>
            <li>
              <Link to="/resources#agile-scrum" className="hover:text-sky-400 transition-colors">
                {"⚙️ Agile & Scrum Quick Guide"}
              </Link>
            </li>
            <li>
              <Link to="/resources#cli-npm" className="hover:text-sky-400 transition-colors">
                {"💻 CLI & NPM Command Cheat Sheet"}
              </Link>
            </li>
            <li>
              <Link
                to="/certificates"
                className="hover:text-sky-400 transition-colors flex items-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                Printable Verifiable Certificates
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-slate-200 mb-3 text-sm">{"Open Source & License"}</h4>
          <p className="text-slate-400 mb-3">
            Open source educational software licensed under the permissive MIT License.
          </p>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <Github className="w-4 h-4 text-slate-400" />
              <span>Original Repository:</span>
            </div>
            <p className="font-mono text-[11px] text-sky-400 break-all">AjinLab/it-beginner-website</p>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>MIT License • Free for Learners</span>
            </div>
          </div>
        </div>
      </div>
      <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400">
        <p>
          © 2026 <strong>AjinLab IT Beginner</strong>. Reconstructed into a production-grade educational
          platform.
        </p>
        <div className="flex items-center gap-4">
          <Link to="/courses" className="hover:text-white transition-colors">
            Syllabus
          </Link>
          <Link to="/playground" className="hover:text-white transition-colors">
            Playground
          </Link>
          <Link to="/quizzes" className="hover:text-white transition-colors">
            Quizzes
          </Link>
          <Link to="/certificates" className="hover:text-white transition-colors">
            Verify Credentials
          </Link>
        </div>
      </div>
    </div>
  </footer>
);
