import React from "react";
import { motion } from "framer-motion";
import { ArrowDownUp, BadgeCheck, MessageSquareText, Send, Star } from "lucide-react";
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
      <PageHero
        eyebrow={data.content.reviewsHeroEyebrow}
        title={data.content.reviewsHeroTitle}
        text={data.content.reviewsHeroText}
        image={data.images.reviewsHero}
      />
      <section className="bg-cream py-16 sm:py-24">
        <div className="container-site">
          <Reveal>
            <div className="grid overflow-hidden rounded-3xl bg-black text-white lg:grid-cols-[.75fr_1.25fr]">
              <div className="flex flex-col items-center justify-center border-b border-white/10 p-10 text-center lg:border-r lg:border-b-0">
                <span className="font-display text-8xl leading-none font-black">{w.toFixed(1)}</span>
                <div className="mt-4">
                  <Stars rating={w} size={22} />
                </div>
                <p className="mt-3 text-xs text-white/45">
                  {"Based on "}
                  {c.length}
                  {" published reviews"}
                </p>
                <span className="mt-5 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[10px] font-bold tracking-wider uppercase">
                  <BadgeCheck size={14} className="text-brand" />
                  Rockville approved
                </span>
              </div>
              <div className="flex flex-col justify-center gap-3 p-8 sm:p-12">
                {[5, 4, 3, 2, 1].map((s) => {
                  const a = c.filter((z) => z.rating === s).length;
                  const T = c.length ? (a / c.length) * 100 : 0;
                  return (
                    <div key={s} className="flex items-center gap-4">
                      <span className="flex w-8 items-center gap-1 text-xs font-bold">
                        {s}
                        <Star size={11} className="fill-amber-400 text-amber-400" />
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          className="h-full rounded-full bg-brand"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${T}%` }}
                          transition={{ duration: 0.8 }}
                        />
                      </div>
                      <span className="w-8 text-right text-xs text-white/40">{a}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>
          <div className="mt-14 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-extrabold tracking-wider text-brand uppercase">Customer stories</p>
              <h2 className="mt-2 font-display text-4xl font-black uppercase">Straight from the people</h2>
            </div>
            <button
              onClick={() => N((s) => (s === "latest" ? "highest" : "latest"))}
              className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[10px] font-bold uppercase shadow-sm"
            >
              <ArrowDownUp size={14} />
              {i === "latest" ? "Latest first" : "Highest rated"}
            </button>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {c.map((s, a) => (
              <Reveal key={s.id} delay={Math.min(a * 0.06, 0.25)}>
                <article className="flex h-full flex-col rounded-3xl bg-white p-7 shadow-sm">
                  <div className="flex items-center justify-between">
                    <Stars rating={s.rating} />
                    <BadgeCheck size={17} className="text-green-600" />
                  </div>
                  <blockquote className="mt-5 flex-1 text-sm leading-7 text-neutral-600">“{s.text}”</blockquote>
                  {s.meal && (
                    <p className="mt-5 text-[10px] font-bold tracking-wider text-brand uppercase">
                      {"Ordered: "}
                      {s.meal}
                    </p>
                  )}
                  <div className="mt-6 flex items-center gap-3 border-t border-black/10 pt-5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black font-display text-lg font-bold text-white">
                      {s.name.charAt(0)}
                    </span>
                    <div>
                      <p className="text-sm font-bold">{s.name}</p>
                      <time className="text-[10px] text-neutral-400">
                        {new Date(`${s.date}T12:00:00`).toLocaleDateString("en-ZA", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </time>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-white py-20 sm:py-24">
        <div className="container-site grid items-start gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <Reveal>
            <div className="lg:sticky lg:top-32">
              <div className="eyebrow">YOUR TURN</div>
              <h2 className="display-title mt-5">{data.content.reviewsFormTitle}</h2>
              <p className="mt-5 text-sm leading-7 text-neutral-500">{data.content.reviewsFormText}</p>
              <div className="mt-7 flex items-center gap-3 text-xs font-bold text-neutral-500">
                <MessageSquareText size={20} className="text-brand" />
                Honest reviews. Real customers.
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <form onSubmit={S} className="rounded-3xl bg-cream p-6 sm:p-9">
              {y && (
                <div className="mb-6 rounded-2xl bg-green-50 p-4 text-sm text-green-700">
                  <p className="font-bold">Thank you for the love.</p>
                  <p className="mt-1 text-xs">Your review has been submitted for moderation.</p>
                </div>
              )}
              <div className="grid gap-5 sm:grid-cols-2">
                <label>
                  <span className="field-label">Your name *</span>
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
              <fieldset className="mt-6">
                <legend className="field-label">Your rating *</legend>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className="p-1 transition hover:scale-110"
                      aria-label={`Rate ${s} stars`}
                    >
                      <Star
                        size={29}
                        className={s <= rating ? "fill-amber-400 text-amber-400" : "fill-neutral-200 text-neutral-200"}
                      />
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="mt-5 block">
                <span className="field-label">Tell us about it *</span>
                <textarea
                  className="field min-h-32 resize-none"
                  value={l}
                  onChange={(s) => g(s.target.value)}
                  maxLength={600}
                  placeholder="How was the flavour, portion and service?"
                />
                <span className="mt-1 block text-right text-[10px] text-neutral-400">{l.length}/600</span>
              </label>
              {h && <p className="mt-3 text-xs text-brand">{h}</p>}
              <button className="btn-primary mt-6 w-full sm:w-auto">
                Submit for review
                <Send size={15} />
              </button>
            </form>
          </Reveal>
        </div>
      </section>
    </>
  );
}
