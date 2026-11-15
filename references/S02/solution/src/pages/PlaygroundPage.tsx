import * as React from "react";
import { Download, Play, Save } from "lucide-react";
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
    ue("Snippet saved to browser storage.");
    
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
  const tabs = [
    { id: "html", label: "HTML", value: S, set: M, placeholder: "<!-- Enter HTML here -->" },
    { id: "css", label: "CSS", value: b, set: x, placeholder: "/* Enter CSS rules here */" },
    { id: "js", label: "JavaScript", value: _, set: R, placeholder: "// Enter JavaScript logic here" },
  ];
  const activeTab = tabs.find((tab) => tab.id === h) || tabs[2];
  return (
    <div className="container-page page">
      <h1 className="page-title">Code playground</h1>
      <p className="lead mt-2">Write HTML, CSS and JavaScript with a sandboxed preview and console output.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-12 sm:items-end">
        <div className="sm:col-span-4">
          <label htmlFor="playground-snippet" className="field-label">
            Snippet
          </label>
          <select id="playground-snippet" value={i} onChange={(event) => { p(event.target.value); ue(null); }} className="field">
            {snippets.map((snippet) => (
              <option key={snippet.id} value={snippet.id}>
                {snippet.title}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-4">
          <label htmlFor="playground-title" className="field-label">
            Title
          </label>
          <input id="playground-title" type="text" value={U} onChange={(event) => V(event.target.value)} className="field" />
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:col-span-4 sm:justify-end">
          <button type="button" onClick={pe} disabled={!U.trim()} className="btn btn-secondary">
            <Save aria-hidden="true" />
            Save
          </button>
          <button type="button" onClick={Be} className="btn btn-secondary" title="Download as HTML">
            <Download aria-hidden="true" />
            Export .html
          </button>
        </div>
      </div>
      <p role="status" className="mt-2 min-h-6 text-sm text-ok">
        {me || ""}
      </p>

      <div className="mt-2 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="surface flex min-w-0 flex-col overflow-hidden lg:col-span-6">
          <div className="flex items-center justify-between gap-3 border-b border-line p-2">
            <div className="flex items-center gap-1" role="tablist" aria-label="Editor language">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={h === tab.id}
                  onClick={() => v(tab.id)}
                  className="option h-8 border-transparent px-3"
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <button type="button" onClick={ne} className="btn btn-primary btn-sm">
              <Play aria-hidden="true" />
              Run code
            </button>
          </div>
          <textarea
            key={activeTab.id}
            aria-label={`${activeTab.label} editor`}
            value={activeTab.value}
            onChange={(event) => activeTab.set(event.target.value)}
            placeholder={activeTab.placeholder}
            spellCheck={false}
            className="min-h-[30rem] w-full flex-1 resize-none bg-[#080c14] p-4 font-mono text-[0.8125rem] leading-6 text-ink-2 focus:outline-none"
          />
        </div>
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-6">
          <div className="surface flex flex-1 flex-col overflow-hidden">
            <h2 className="border-b border-line px-4 py-2.5 text-sm font-medium text-ink-2">Preview</h2>
            <iframe ref={be} title="Sandbox preview" sandbox="allow-scripts" className="min-h-[17.5rem] w-full flex-1 border-none bg-[#0f172a]" />
          </div>
          <div className="surface flex h-48 flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-4 py-1.5">
              <h2 className="text-sm font-medium text-ink-2">Console</h2>
              <button type="button" onClick={() => F([])} className="link text-[0.8125rem]">
                Clear
              </button>
            </div>
            <div className="flex-1 overflow-y-auto bg-[#080c14] p-4 font-mono text-[0.8125rem] leading-6" aria-live="polite">
              {k.length === 0 ? (
                <p className="text-ink-3">No console output yet. Use console.log() in your JavaScript.</p>
              ) : (
                k.map((entry: any, index) => (
                  <div key={index} className={entry.type === "error" ? "text-bad" : entry.type === "warn" ? "text-warn" : "text-ink-2"}>
                    {entry.text}
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
