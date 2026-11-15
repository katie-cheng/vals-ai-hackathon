import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Expand, X } from "lucide-react";
import { PageHero } from "../components/UI";
import { useStore } from "../lib/store";

export default function GalleryPage() {
  const { data } = useStore();
  const [i, u] = React.useState("All");
  const [s, r] = React.useState(null);
  const x = ["All", ...Array.from(new Set<any>(data.gallery.map((t) => t.category)))];
  const a = React.useMemo(
    () => [...data.gallery].filter((t) => i === "All" || t.category === i).sort((t, l) => t.order - l.order),
    [data.gallery, i],
  );
  React.useEffect(() => {
    if (s === null) return;
    const t = (l) => {
      if (l.key === "Escape") {
        r(null);
      }
      if (l.key === "ArrowRight") {
        r((o) => (o === null ? null : (o + 1) % a.length));
      }
      if (l.key === "ArrowLeft") {
        r((o) => (o === null ? null : (o - 1 + a.length) % a.length));
      }
    };
    window.addEventListener("keydown", t);
    return () => window.removeEventListener("keydown", t);
  }, [s, a.length]);
  return (
    <>
      <PageHero
        eyebrow={data.content.galleryHeroEyebrow}
        title={data.content.galleryHeroTitle}
        text={data.content.galleryHeroText}
        image={data.images.galleryHero}
      />
      <section className="bg-cream py-14 sm:py-20">
        <div className="container-site">
          <div className="no-scrollbar mb-10 flex gap-2 overflow-x-auto">
            {x.map((t) => (
              <button
                key={t}
                onClick={() => {
                  u(t);
                  r(null);
                }}
                className={`shrink-0 rounded-full px-5 py-2.5 text-[10px] font-extrabold tracking-wider uppercase transition ${i === t ? "bg-brand text-white" : "bg-white text-neutral-500 hover:bg-black hover:text-white"}`}
              >
                {t}
              </button>
            ))}
          </div>
          <motion.div
            layout
            className="grid auto-rows-[240px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:auto-rows-[280px]"
          >
            {a.map((t, l) => (
              <motion.button
                key={t.id}
                layout
                onClick={() => r(l)}
                className={`group relative overflow-hidden rounded-2xl bg-black text-left ${l % 5 === 0 ? "sm:row-span-2" : ""} ${l % 7 === 3 ? "lg:col-span-2" : ""}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(l * 0.05, 0.3) }}
              >
                <img
                  src={t.src}
                  alt={t.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105 group-hover:opacity-75"
                  style={{ objectPosition: t.src.includes("hero-") ? "72% center" : "center" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-80" />
                <div className="absolute right-5 bottom-5 left-5 flex items-end justify-between gap-4 text-white">
                  <div>
                    <p className="text-[9px] font-bold tracking-[.16em] text-brand uppercase">{t.category}</p>
                    <h2 className="mt-1 font-display text-2xl font-bold uppercase">{t.title}</h2>
                  </div>
                  <span className="flex h-10 w-10 shrink-0 translate-y-2 items-center justify-center rounded-full bg-white text-black opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                    <Expand size={17} />
                  </span>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>
      <AnimatePresence>
        {s !== null && a[s] && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/95 p-4 sm:p-10"
            role="dialog"
            aria-modal="true"
            aria-label={a[s].title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              onClick={() => r(null)}
              className="absolute top-5 right-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white hover:bg-white hover:text-black"
              aria-label="Close gallery"
            >
              <X />
            </button>
            <button
              onClick={() => r((s - 1 + a.length) % a.length)}
              className="absolute left-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-brand sm:left-8"
              aria-label="Previous image"
            >
              <ArrowLeft />
            </button>
            <motion.figure
              key={a[s].id}
              className="max-w-6xl"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <img
                src={a[s].src}
                alt={a[s].title}
                className="max-h-[78svh] w-auto max-w-full rounded-lg object-contain"
              />
              <figcaption className="mt-4 text-center text-white">
                <p className="font-display text-2xl font-bold uppercase">{a[s].title}</p>
                <p className="mt-1 text-[10px] tracking-wider text-white/45 uppercase">
                  {s + 1}
                  {" / "}
                  {a.length}
                  {" · "}
                  {a[s].category}
                </p>
              </figcaption>
            </motion.figure>
            <button
              onClick={() => r((s + 1) % a.length)}
              className="absolute right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-brand sm:right-8"
              aria-label="Next image"
            >
              <ArrowRight />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
