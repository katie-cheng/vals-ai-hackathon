import React from "react";
import { useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";
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
      <PageHero title={data.content.menuHeroTitle} text={data.content.menuHeroText} image={data.images.menuHero} />
      <div className="sticky top-[101px] z-30 border-b border-black/10 bg-white">
        <div className="container-site py-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative lg:w-64 lg:shrink-0">
              <Search size={16} className="absolute top-1/2 left-3.5 -translate-y-1/2 text-neutral-500" />
              <input
                value={c}
                onChange={(s) => l(s.target.value)}
                className="field !h-9 !py-0 !pl-10"
                placeholder="Search kotas, burgers, chips..."
                aria-label="Search menu"
              />
              {c && (
                <button
                  onClick={() => l("")}
                  className="absolute top-1/2 right-2 flex h-7 w-7 -translate-y-1/2 items-center justify-center text-neutral-500"
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>
            <div className="no-scrollbar flex flex-1 gap-2 overflow-x-auto" role="group" aria-label="Menu categories">
              <button onClick={() => i("all")} aria-pressed={t === "all"} className={`chip ${t === "all" ? "chip-active" : ""}`}>
                All
              </button>
              {x.map((s) => (
                <button
                  key={s.id}
                  onClick={() => i(s.id)}
                  aria-pressed={t === s.id}
                  className={`chip ${t === s.id ? "chip-active" : ""}`}
                >
                  {s.name}
                </button>
              ))}
              <button onClick={() => u((s) => !s)} aria-pressed={n} className={`chip ${n ? "chip-active" : ""}`}>
                Favourites only
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* The results keep a full-screen minimum height so filtering never collapses the page under the reader. */}
      <section className="min-h-[100svh] bg-cream py-10 sm:py-12">
        <div className="container-site">
          <h2 className="mb-6 font-display text-3xl font-semibold uppercase" aria-live="polite">
            {t === "all" ? "All meals" : x.find((s) => s.id === t)?.name}
            {` (${o.length})`}
          </h2>
          {o.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {o.map((s) => (
                <MenuCard key={s.id} item={s} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No meals found"
              text="Try another search or category."
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
        <div className="container-site">
          <h2 className="font-display text-2xl font-semibold uppercase">{data.content.menuBottomTitle}</h2>
          <p className="mt-1 text-[15px] text-white/75">{data.content.menuBottomText}</p>
        </div>
      </section>
    </>
  );
}
