import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Heading } from "../components/motion";
import { CtaBanner, InsightCard, PageHero } from "../components/shared";
import { insights } from "../data/content";

const CATEGORIES = ["All", ...Array.from(new Set(insights.map((a) => a.category)))];

export function Insights() {
  const [category, setCategory] = useState("All");
  const shown = category === "All" ? insights : insights.filter((a) => a.category === category);
  return (
    <>
      <PageHero title="Thinking that ships revenue." copy="Playbooks, teardowns, and honest opinions from 120+ engagements. Every article ends with something you can ship.">
        <div className="mt-8 inline-flex max-w-full flex-wrap rounded-md border border-ink-900/20 p-1" role="group" aria-label="Filter by category">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
              className={`h-9 rounded-[4px] px-4 text-[15px] whitespace-nowrap transition-colors ${category === c ? "bg-ink-900 text-cream-50" : "text-ink-700 hover:text-ink-900"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </PageHero>
      <section className="container-x pb-[clamp(4rem,7vw,6.5rem)]">
        <div className="grid min-h-[24rem] content-start gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((a) => (
            <InsightCard key={a.slug} article={a} />
          ))}
        </div>
      </section>
      <CtaBanner title="Want this thinking applied to your funnel?" />
    </>
  );
}

export function InsightPost() {
  const { slug } = useParams();
  const post: any = insights.find((a) => a.slug === slug);
  if (!post) return <Navigate to="/insights" replace={true} />;
  const index = insights.indexOf(post);
  const more = [insights[(index + 1) % insights.length], insights[(index + 2) % insights.length]];
  return (
    <>
      <article className="container-x pt-10 pb-[clamp(4rem,7vw,6.5rem)] lg:pt-14">
        <div className="mx-auto max-w-3xl">
          <Link to="/insights" className="inline-flex items-center gap-2 text-[15px] text-ink-500 transition-colors hover:text-ink-900">
            <ArrowLeft className="h-4 w-4" aria-hidden={true} />
            All insights
          </Link>
          <h1 className="display-lg mt-8">{post.title}</h1>
          <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-3 border-y border-ink-900/15 py-4 text-[15px] sm:grid-cols-4">
            {[
              ["Written by", post.author.name],
              ["Category", post.category],
              ["Published", post.date],
              ["Length", post.readTime],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-ink-500">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="mx-auto mt-10 aspect-[2/1] max-w-5xl overflow-hidden rounded-lg bg-cream-200">
          <img src={post.image} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="mx-auto mt-10 max-w-3xl">
          {post.body.map((b: any, i: number) =>
            b.type === "h2" ? (
              <h2 key={i} className="display-sm mt-10">
                {b.text}
              </h2>
            ) : b.type === "quote" ? (
              <blockquote key={i} className="display-sm my-8 border-l border-pine-700 pl-6">
                {b.text}
              </blockquote>
            ) : b.type === "list" ? (
              <ul key={i} className="mt-5 list-disc space-y-2 pl-5 text-[17px] leading-relaxed text-ink-700 marker:text-ink-400">
                {b.items.map((item: string) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p key={i} className="mt-5 text-[17px] leading-[1.75] text-ink-700">
                {b.text}
              </p>
            ),
          )}
        </div>
      </article>
      <section className="container-x pb-[clamp(4rem,7vw,6.5rem)]">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <Heading text="Keep reading." className="display-md" />
          <Link to="/insights" className="text-link text-[15px]">
            All articles
          </Link>
        </div>
        <div className="mt-10 grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {more.map((a) => (
            <InsightCard key={a.slug} article={a} />
          ))}
        </div>
      </section>
      <CtaBanner />
    </>
  );
}
