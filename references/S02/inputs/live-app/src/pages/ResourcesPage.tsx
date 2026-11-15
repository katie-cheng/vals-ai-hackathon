import * as React from "react";
import { Check, Copy } from "lucide-react";
import { HANDBOOKS } from "../data/handbooks";

export const ResourcesPage = () => {
  const [c, d] = React.useState("javascript");
  const [f, i] = React.useState(null);
  const p = HANDBOOKS.find((handbook) => handbook.id === c) || HANDBOOKS[0];
  const h = (v, T) => {
    navigator.clipboard.writeText(v);
    i(T);
    setTimeout(() => i(null), 2e3);
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="pb-4 border-b border-slate-800 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
            Developer Cheatsheets
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
            Course Handbook
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{"Course Resources & Cheatsheets"}</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Quick reference guides, syntax summaries, and copyable snippets covering every topic taught across
          the IT Beginner curriculum.
        </p>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs scrollbar-thin">
        {HANDBOOKS.map((handbook) => (
          <button
            key={handbook.id}
            onClick={() => d(handbook.id)}
            className={`px-4 py-2 rounded-xl font-bold shrink-0 transition-colors ${c === handbook.id ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20" : "bg-slate-900 text-slate-300 hover:text-white border border-slate-800"}`}
          >
            {handbook.title}
          </button>
        ))}
      </div>
      <div className="space-y-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs text-sky-400 font-bold">
            <span>Chapter {p.chapterNumber} Handbook</span>
            <span>•</span>
            <span>{p.category}</span>
          </div>
          <h2 className="text-2xl font-black text-white">{p.title}</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{p.summary}</p>
        </div>
        <div className="space-y-6">
          {p.subsections.map((subsection, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl"
            >
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">{subsection.heading}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{subsection.description}</p>
              </div>
              {subsection.codeSnippet && (
                <div className="space-y-1 relative">
                  <div className="flex items-center justify-between text-xs pb-1 text-slate-400 font-mono">
                    <span>Syntax Reference:</span>
                    <button
                      onClick={() => h(subsection.codeSnippet, `sub-${index}`)}
                      className="text-sky-400 hover:underline flex items-center gap-1"
                    >
                      {f === `sub-${index}` ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Snippet</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-sky-300 overflow-x-auto leading-relaxed">
                    <code>{subsection.codeSnippet}</code>
                  </pre>
                </div>
              )}
              {subsection.tips && (
                <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                  <span className="font-bold text-amber-400 block font-mono text-[11px]">
                    {"Best Practices & Tips:"}
                  </span>
                  <ul className="space-y-1 pl-4 list-disc text-slate-300">
                    {subsection.tips.map((tip, index2) => (
                      <li key={index2} className="leading-relaxed">
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
