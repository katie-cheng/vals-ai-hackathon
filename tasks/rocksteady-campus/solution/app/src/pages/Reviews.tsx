import React from "react";
import { ArrowDownUp, Star } from "lucide-react";
import { PageHero, Reveal, Stars } from "../components/UI";
import { useStore } from "../lib/store";

export default function ReviewsPage() {
  const { data, submitReview } = useStore();
  const [i, N] = React.useState("latest");
  const [d, n] = React.useState("");
  const [x, p] = React.useState("");
  const [rating, setRating] = React.useState(5);
  const [l, g] = React.useState("");
  const [h, v] = React.useState("");
  const [y, k] = React.useState(false);
  const c = React.useMemo(
    () =>
      data.reviews
        .filter((s) => s.status === "approved")
        .sort((s, a) =>
          i === "latest" ? a.date.localeCompare(s.date) : a.rating - s.rating || a.date.localeCompare(s.date),
        ),
    [data.reviews, i],
  );
  const w = c.length ? c.reduce((s, a) => s + a.rating, 0) / c.length : 0;
  const S = (s) => {
    if ((s.preventDefault(), !d.trim() || l.trim().length < 12)) {
      v("Please add your name and a review of at least 12 characters.");
      return;
    }
    submitReview({ name: d.trim(), rating, text: l.trim(), meal: x.trim() });
    k(true);
    v("");
    n("");
    p("");
    g("");
    setRating(5);
  };
  return (
    <>
      <PageHero title={data.content.reviewsHeroTitle} text={data.content.reviewsHeroText} image={data.images.reviewsHero} />
      <section className="section bg-cream">
        <div className="container-site">
          <Reveal>
            <div className="grid overflow-hidden rounded-lg bg-black text-white lg:grid-cols-12">
              <div className="flex flex-col justify-center border-b border-white/10 p-8 lg:col-span-4 lg:border-r lg:border-b-0">
                <span className="font-display text-5xl leading-none font-semibold">{w.toFixed(1)}</span>
                <div className="mt-3">
                  <Stars rating={w} size={20} />
                </div>
                <p className="mt-3 text-[13px] text-white/70">
                  {"Based on "}
                  {c.length}
                  {" published reviews"}
                </p>
              </div>
              <div className="flex flex-col justify-center gap-3 p-8 lg:col-span-8">
                {[5, 4, 3, 2, 1].map((s) => {
                  const a = c.filter((z) => z.rating === s).length;
                  const T = c.length ? (a / c.length) * 100 : 0;
                  return (
                    <div key={s} className="flex items-center gap-4">
                      <span className="w-14 text-[13px] whitespace-nowrap">{s === 1 ? "1 star" : `${s} stars`}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-brand" style={{ width: `${T}%` }} />
                      </div>
                      <span className="w-6 text-right text-[13px] text-white/70">{a}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>
          <div className="mt-12 flex items-end justify-between gap-4">
            <h2 className="display-title">Straight from the people</h2>
            <button
              onClick={() => N((s) => (s === "latest" ? "highest" : "latest"))}
              className="btn-outline btn-sm shrink-0"
              aria-label="Change review order"
            >
              <ArrowDownUp size={14} />
              {i === "latest" ? "Latest first" : "Highest rated"}
            </button>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {c.map((s) => (
              <article key={s.id} className="card flex h-full flex-col p-6">
                <Stars rating={s.rating} />
                <blockquote className="mt-4 flex-1 text-[15px] leading-7 text-neutral-700">“{s.text}”</blockquote>
                <div className="mt-5 border-t border-black/10 pt-4 text-sm">
                  <p className="font-semibold">{s.name}</p>
                  <p className="mt-0.5 text-[13px] text-neutral-600">
                    {s.meal && `Ordered ${s.meal}, `}
                    <time>
                      {new Date(`${s.date}T12:00:00`).toLocaleDateString("en-ZA", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </time>
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section bg-white">
        <div className="container-site grid items-start gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:sticky lg:top-32 lg:col-span-5">
            <h2 className="display-title">{data.content.reviewsFormTitle}</h2>
            <p className="mt-3 text-[15px] leading-7 text-neutral-600">{data.content.reviewsFormText}</p>
          </div>
          <form onSubmit={S} noValidate className="rounded-lg bg-cream p-6 sm:p-8 lg:col-span-7">
            {y && (
              <div role="status" className="mb-6 rounded-md bg-green-50 p-4 text-sm text-green-800">
                <p className="font-semibold">Thank you for the love.</p>
                <p className="mt-1">Your review has been submitted for moderation.</p>
              </div>
            )}
            <div className="grid gap-5 sm:grid-cols-2">
              <label>
                <span className="field-label">Your name (required)</span>
                <input className="field" value={d} onChange={(s) => n(s.target.value)} placeholder="e.g. Thabo M." />
              </label>
              <label>
                <span className="field-label">What did you order?</span>
                <input
                  className="field"
                  value={x}
                  onChange={(s) => p(s.target.value)}
                  placeholder="e.g. Full House Kota"
                />
              </label>
            </div>
            <fieldset className="mt-5">
              <legend className="field-label">Your rating</legend>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    className="flex h-10 w-10 items-center justify-center"
                    aria-label={`Rate ${s} ${s === 1 ? "star" : "stars"}`}
                    aria-pressed={s === rating}
                  >
                    <Star
                      size={28}
                      className={s <= rating ? "fill-amber-400 text-amber-400" : "fill-neutral-300 text-neutral-300"}
                    />
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="mt-5 block">
              <span className="field-label">Tell us about it (required)</span>
              <textarea
                className="field min-h-32 resize-none"
                value={l}
                onChange={(s) => g(s.target.value)}
                maxLength={600}
                placeholder="How was the flavour, portion and service?"
              />
              <span className="mt-1 block text-right text-xs text-neutral-600">{l.length}/600</span>
            </label>
            {h && (
              <p role="alert" className="mt-3 text-sm text-brand-dark">
                {h}
              </p>
            )}
            <button className="btn-primary mt-6 w-full sm:w-auto">Submit for review</button>
          </form>
        </div>
      </section>
    </>
  );
}
