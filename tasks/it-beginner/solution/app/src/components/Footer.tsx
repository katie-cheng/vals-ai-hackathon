import { Link } from "react-router-dom";
import { CHAPTERS } from "../data/chapters";
import { Logo } from "./Logo";

const TOOLS = [
  { label: "Live code playground", to: "/playground" },
  { label: "JavaScript handbook", to: "/resources#javascript" },
  { label: "HTML5 and CSS3 flexbox reference", to: "/resources#html-css" },
  { label: "Agile and Scrum quick guide", to: "/resources#agile-scrum" },
  { label: "CLI and NPM command cheat sheet", to: "/resources#cli-npm" },
  { label: "Printable certificates", to: "/certificates" },
];

export const Footer = () => (
  <footer className="no-print border-t border-line">
    <div className="container-page py-12">
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-ink-3">
            The AjinLab IT Beginner curriculum: 42 lessons, an in-browser code sandbox, chapter quizzes and
            printable certificates.
          </p>
        </div>
        <div className="lg:col-span-3">
          <h2 className="text-sm font-semibold text-ink">Curriculum</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {CHAPTERS.map((chapter) => (
              <li key={chapter.id}>
                <Link to="/courses" className="text-ink-3 transition-colors hover:text-ink">
                  {chapter.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-3">
          <h2 className="text-sm font-semibold text-ink">Tools</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {TOOLS.map((tool) => (
              <li key={tool.to}>
                <Link to={tool.to} className="text-ink-3 transition-colors hover:text-ink">
                  {tool.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-ink">Account</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {[
              ["Search lessons", "/search"],
              ["Profile", "/profile"],
              ["Sign in", "/login"],
              ["Create an account", "/register"],
            ].map(([label, to]) => (
              <li key={to}>
                <Link to={to} className="text-ink-3 transition-colors hover:text-ink">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <h2 className="mt-8 text-sm font-semibold text-ink">Open source</h2>
          <p className="mt-3 text-sm text-ink-3">
            MIT licensed and free for learners. Source:{" "}
            <a
              href="https://github.com/AjinLab/it-beginner-website"
              target="_blank"
              rel="noreferrer"
              className="link break-words"
            >
              AjinLab/it-beginner-website
            </a>
          </p>
        </div>
      </div>
      <p className="meta mt-10 border-t border-line pt-6">© 2026 AjinLab IT Beginner</p>
    </div>
  </footer>
);
