import * as React from "react";
import { Check, Copy } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { HANDBOOKS } from "../data/handbooks";

export const ResourcesPage = () => {
  const { hash } = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = React.useState<number | null>(null);
  const handbook: any = HANDBOOKS.find((item) => item.id === hash.slice(1)) || HANDBOOKS[0];

  const copy = (snippet: string, index: number) => {
    navigator.clipboard?.writeText(snippet);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="container-page page">
      <h1 className="page-title">Course resources and cheatsheets</h1>
      <p className="lead mt-2">
        Quick reference guides, syntax summaries, and copyable snippets covering every topic taught across the IT
        Beginner curriculum.
      </p>

      <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Handbooks">
        {HANDBOOKS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={item.id === handbook.id}
            onClick={() => navigate(`/resources#${item.id}`, { replace: true })}
            className="option"
          >
            {item.title}
          </button>
        ))}
      </div>

      <div key={handbook.id} className="fade-in mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12" role="tabpanel">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-24">
            <h2 className="section-title">{handbook.title}</h2>
            <p className="meta mt-1">
              Chapter {handbook.chapterNumber}, {handbook.category}
            </p>
            <p className="mt-3 text-sm text-ink-2">{handbook.summary}</p>
          </div>
        </div>
        <div className="min-w-0 space-y-12 lg:col-span-8">
          {handbook.subsections.map((subsection: any, index: number) => (
            <section key={`${handbook.id}-${index}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="item-title">{subsection.heading}</h3>
                  <p className="mt-1 text-sm text-ink-3">{subsection.description}</p>
                </div>
                {subsection.codeSnippet && (
                  <button
                    type="button"
                    onClick={() => copy(subsection.codeSnippet, index)}
                    className="btn btn-secondary btn-sm w-[5.5rem] flex-none"
                    aria-label={`Copy the ${subsection.heading} snippet`}
                  >
                    {copied === index ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                    {copied === index ? "Copied" : "Copy"}
                  </button>
                )}
              </div>
              {subsection.codeSnippet && (
                <pre className="code-block mt-4">
                  <code>{subsection.codeSnippet}</code>
                </pre>
              )}
              {subsection.tips && (
                <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-ink-2 marker:text-ink-3">
                  {subsection.tips.map((tip: string, tipIndex: number) => (
                    <li key={tipIndex}>{tip}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};
