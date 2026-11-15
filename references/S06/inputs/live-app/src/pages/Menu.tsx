import React from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { EmptyState, MenuCard, PageHero } from "../components/UI";
import { useStore } from "../lib/store";

export default function MenuPage() {
  const { data } = useStore();
  const [h, m] = useSearchParams();
  const t = h.get("category") || "all";
  const [c, l] = React.useState("");
  const [n, u] = React.useState(false);
  const x = [...data.categories].sort((s, r) => s.order - r.order);
  const o = React.useMemo(
    () =>
      data.items
        .filter((s) => {
          const r = t === "all" || s.category === t;
          const p = c.trim().toLowerCase();
          const b = !p || `${s.name} ${s.description}`.toLowerCase().includes(p);
          return r && b && (!n || s.featured || s.popular);
        })
        .sort((s, r) => s.order - r.order),
    [data.items, t, c, n],
  );
  const i = (category) => {
    m(category === "all" ? {} : { category }, { replace: true });
  };
  return (
    <>
      <PageHero
        eyebrow={data.content.menuHeroEyebrow}
        title={data.content.menuHeroTitle}
        text={data.content.menuHeroText}
        image={data.images.menuHero}
      />
      <div className="sticky top-[101px] z-30 border-b border-black/10 bg-white/95 shadow-sm backdrop-blur-xl">
        <div className="container-site py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1 lg:max-w-xs">
              <Search size={17} className="absolute top-1/2 left-4 -translate-y-1/2 text-neutral-400" />
              <input
                value={c}
                onChange={(s) => l(s.target.value)}
                className="field !rounded-full !py-2.5 !pl-11"
                placeholder="Search kotas, burgers, chips..."
                aria-label="Search menu"
              />
              {c && (
                <button
                  onClick={() => l("")}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400"
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>
            <div className="no-scrollbar flex flex-1 gap-2 overflow-x-auto">
              <button
                onClick={() => i("all")}
                className={`shrink-0 rounded-full px-4 py-2.5 text-[10px] font-extrabold tracking-wider uppercase transition ${t === "all" ? "bg-black text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}
              >
                All
              </button>
              {x.map((s) => (
                <button
                  key={s.id}
                  onClick={() => i(s.id)}
                  className={`shrink-0 rounded-full px-4 py-2.5 text-[10px] font-extrabold tracking-wider uppercase transition ${t === s.id ? "bg-brand text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}
                >
                  {s.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => u((s) => !s)}
              className={`flex shrink-0 items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-[10px] font-extrabold tracking-wider uppercase ${n ? "border-brand bg-red-50 text-brand" : "border-black/10"}`}
            >
              <SlidersHorizontal size={14} />
              Favourites
            </button>
          </div>
        </div>
      </div>
      <section className="min-h-[60vh] bg-cream py-12 sm:py-16">
        <div className="container-site">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-extrabold tracking-[.18em] text-brand uppercase">
                {t === "all" ? "The full line-up" : x.find((s) => s.id === t)?.name}
              </p>
              <h2 className="mt-2 font-display text-4xl font-black uppercase">
                {o.length}
                {" delicious "}
                {o.length === 1 ? "choice" : "choices"}
              </h2>
            </div>
            <p className="hidden text-xs text-neutral-400 sm:block">Prices include all the flavour.</p>
          </div>
          {o.length ? (
            <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {o.map((s) => (
                  <motion.div
                    key={s.id}
                    layout
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.25 }}
                  >
                    <MenuCard item={s} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <EmptyState
              title="No meals found"
              text="Try another search or category. Your next favourite might be one click away."
              actionLabel="Reset the menu"
              onAction={() => {
                l("");
                u(false);
                i("all");
              }}
            />
          )}
        </div>
      </section>
      <section className="bg-black py-10 text-white">
        <div className="container-site flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <div>
            <h3 className="font-display text-3xl font-bold uppercase">{data.content.menuBottomTitle}</h3>
            <p className="mt-1 text-xs text-white/50">{data.content.menuBottomText}</p>
          </div>
          <span className="rounded-full border border-white/15 px-5 py-2 text-[10px] font-bold tracking-wider text-white/60 uppercase">
            Customise · Add · Enjoy
          </span>
        </div>
      </section>
    </>
  );
}
