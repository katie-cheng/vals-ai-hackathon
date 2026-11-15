import * as React from "react";
import { Download, Play, RotateCcw, Save, Terminal } from "lucide-react";
import { PLAYGROUND_TEMPLATES } from "../data/playground";
import { useCourse } from "../context/CourseContext";

export const PlaygroundPage = () => {
  const { snippets, saveSnippet, deleteSnippet } = useCourse();
  const [i, p] = React.useState("js-variables");
  const [h, v] = React.useState("js");
  const T = snippets.find((snippet) => snippet.id === i) || PLAYGROUND_TEMPLATES[0];
  const [S, M] = React.useState(T.htmlCode);
  const [b, x] = React.useState(T.cssCode);
  const [_, R] = React.useState(T.jsCode);
  const [U, V] = React.useState(T.title);
  const [k, F] = React.useState([]);
  const [$, te] = React.useState(false);
  const [me, ue] = React.useState(null);
  const be = React.useRef(null);
  React.useEffect(() => {
    const re = snippets.find((snippet) => snippet.id === i) || PLAYGROUND_TEMPLATES[0];
    M(re.htmlCode);
    x(re.cssCode);
    R(re.jsCode);
    V(re.title);
    F([]);
  }, [i]);
  const ne = () => {
    F([]);
    const re = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              padding: 20px;
              color: #f1f5f9;
              background-color: #0f172a;
              margin: 0;
            }
            ${b}
          </style>
        </head>
        <body>
          ${S}
          <script>
            (function() {
              const sendLog = (type, args) => {
                const message = args.map(a => {
                  try {
                    return typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a);
                  } catch (e) {
                    return String(a);
                  }
                }).join(' ');
                window.parent.postMessage({ source: 'itb-sandbox', type: type, message: message }, '*');
              };

              const originalLog = console.log;
              const originalWarn = console.warn;
              const originalError = console.error;

              console.log = function(...args) {
                sendLog('log', args);
                originalLog.apply(console, args);
              };
              console.warn = function(...args) {
                sendLog('warn', args);
                originalWarn.apply(console, args);
              };
              console.error = function(...args) {
                sendLog('error', args);
                originalError.apply(console, args);
              };

              window.onerror = function(message, source, lineno, colno, error) {
                sendLog('error', [message + ' (line ' + lineno + ')']);
              };

              try {
                ${_}
              } catch (err) {
                console.error(err.message);
              }
            })();
          <\/script>
        </body>
      </html>
    `;
    if (be.current) {
      be.current.srcdoc = re;
    }
  };
  React.useEffect(() => {
    ne();
  }, [i]);
  React.useEffect(() => {
    const re = (Le) => {
      if (Le.data && Le.data.source === "itb-sandbox") {
        F((qe) => [
          ...qe,
          {
            type: Le.data.type,
            text: Le.data.message,
          },
        ]);
      }
    };
    window.addEventListener("message", re);
    return () => window.removeEventListener("message", re);
  }, []);
  const pe = () => {
    const Le = PLAYGROUND_TEMPLATES.some((template) => template.id === i) ? undefined : i;
    const qe = saveSnippet(U, "Custom Code", S, b, _, Le);
    p(qe.id);
    ue("Snippet saved successfully to browser storage!");
    setTimeout(() => ue(null), 3e3);
  };
  const Be = () => {
    const re = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${U}</title>
  <style>
${b}
  </style>
</head>
<body>
${S}
  <script>
${_}
  <\/script>
</body>
</html>`;
    const Le = new Blob([re], {
      type: "text/html",
    });
    const qe = URL.createObjectURL(Le);
    const Ye = document.createElement("a");
    Ye.href = qe;
    Ye.download = `${U.toLowerCase().replace(/[^a-z0-9]/g, "-")}.html`;
    Ye.click();
    URL.revokeObjectURL(qe);
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">In-Browser IDE</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Isolated Sandbox
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Interactive Code Playground</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Write live HTML, CSS, and JavaScript with instant iframe preview and terminal console output.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={ne}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            <span>Run Code</span>
          </button>
          <button
            onClick={pe}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Save className="w-3.5 h-3.5 text-emerald-400" />
            <span>Save Snippet</span>
          </button>
          <button
            onClick={Be}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            title="Download as HTML"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export .html</span>
          </button>
        </div>
      </div>
      {me && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold animate-in fade-in">
          ✓ {me}
        </div>
      )}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs scrollbar-thin">
        <span className="text-slate-400 text-[11px] font-semibold shrink-0">Course Presets:</span>
        {snippets.map((snippet) => (
          <button
            key={snippet.id}
            onClick={() => p(snippet.id)}
            className={`px-3 py-1.5 rounded-lg shrink-0 font-medium transition-colors ${i === snippet.id ? "bg-sky-500/20 text-sky-400 border border-sky-500/40 font-bold" : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"}`}
          >
            {snippet.title}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">
        <div className="lg:col-span-6 flex flex-col rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between p-2.5 bg-slate-950 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-1">
              <button
                onClick={() => v("html")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${h === "html" ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" : "text-slate-400 hover:text-white"}`}
              >
                HTML
              </button>
              <button
                onClick={() => v("css")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${h === "css" ? "bg-sky-500/20 text-sky-400 border border-sky-500/30" : "text-slate-400 hover:text-white"}`}
              >
                CSS
              </button>
              <button
                onClick={() => v("js")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${h === "js" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "text-slate-400 hover:text-white"}`}
              >
                JavaScript
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={U}
                onChange={(event) => V(event.target.value)}
                placeholder="Snippet title..."
                className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs font-medium w-36 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
          <div className="flex-1 p-3 bg-slate-950 relative">
            {h === "html" && (
              <textarea
                value={S}
                onChange={(event) => M(event.target.value)}
                className="w-full h-full min-h-[460px] p-3 bg-transparent text-orange-200 font-mono text-xs focus:outline-none resize-none leading-relaxed"
                placeholder="<!-- Enter HTML here -->"
                spellCheck={false}
              />
            )}
            {h === "css" && (
              <textarea
                value={b}
                onChange={(event) => x(event.target.value)}
                className="w-full h-full min-h-[460px] p-3 bg-transparent text-sky-200 font-mono text-xs focus:outline-none resize-none leading-relaxed"
                placeholder="/* Enter CSS rules here */"
                spellCheck={false}
              />
            )}
            {h === "js" && (
              <textarea
                value={_}
                onChange={(event) => R(event.target.value)}
                className="w-full h-full min-h-[460px] p-3 bg-transparent text-amber-200 font-mono text-xs focus:outline-none resize-none leading-relaxed"
                placeholder="// Enter JavaScript logic here"
                spellCheck={false}
              />
            )}
          </div>
        </div>
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="flex-1 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl flex flex-col min-h-[340px]">
            <div className="flex items-center justify-between p-2.5 bg-slate-950 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                <span className="font-bold text-slate-200">Live Preview</span>
              </div>
              <button
                onClick={ne}
                className="text-[11px] text-sky-400 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Refresh DOM</span>
              </button>
            </div>
            <div className="flex-1 bg-slate-900 relative">
              <iframe
                ref={be}
                title="Sandbox Preview"
                sandbox="allow-scripts"
                className="w-full h-full min-h-[280px] border-none"
              />
            </div>
          </div>
          <div className="h-48 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-2 bg-slate-900 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-sky-400" />
                <span className="font-bold text-slate-300 font-mono">Terminal Output</span>
              </div>
              <button onClick={() => F([])} className="text-[10px] text-slate-400 hover:text-white">
                Clear Console
              </button>
            </div>
            <div className="flex-1 p-3 overflow-y-auto font-mono text-[11px] space-y-1">
              {k.length === 0 ? (
                <p className="text-slate-400 italic">
                  No console logs yet. Use console.log() in your JS code.
                </p>
              ) : (
                k.map((re, index) => (
                  <div
                    key={index}
                    className={`leading-relaxed ${re.type === "error" ? "text-rose-400" : re.type === "warn" ? "text-amber-400" : "text-emerald-400"}`}
                  >
                    <span className="text-slate-400">{">"}</span> {re.text}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
