import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { GALLERY, GALLERY_CATEGORIES, type GalleryCategory } from "../content";
import { Modal } from "./Modal";
import { Reveal } from "./Reveal";

type Filter = "All" | GalleryCategory;

export function Gallery() {
  const [filter, setFilter] = useState<Filter>("All");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const items = filter === "All" ? GALLERY : GALLERY.filter((g) => g.category === filter);
  const close = useCallback(() => setOpenIndex(null), []);
  const step = useCallback((delta: number) => setOpenIndex((i) => (i === null ? i : (i + delta + items.length) % items.length)), [items.length]);

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openIndex, step]);

  const current = openIndex === null ? null : items[openIndex];

  return (
    <section id="gallery" className="bg-charcoal py-24 text-ivory sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-6">
            <h2 className="section-title">Beauty inspiration</h2>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-5 lg:col-start-8">
            <p className="text-ivory/75">
              Looks and ideas to bring to your appointment. These are illustrative photographs, not the salon's own work; ask us to see recent looks when you
              visit.
            </p>
          </Reveal>
        </div>

        <div role="group" aria-label="Filter gallery" className="mt-12 flex flex-wrap gap-x-7 gap-y-3 border-b border-ivory/15">
          {(["All", ...GALLERY_CATEGORIES] as Filter[]).map((cat) => (
            <button
              key={cat}
              type="button"
              aria-pressed={filter === cat}
              onClick={() => setFilter(cat)}
              className={`-mb-px border-b-2 pb-3 text-[0.98rem] transition ${
                filter === cat ? "border-champagne text-ivory" : "border-transparent text-ivory/60 hover:text-ivory"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <motion.ul layout className="mt-10 columns-2 gap-4 sm:gap-5 lg:columns-3">
          <AnimatePresence mode="popLayout">
            {items.map((item, i) => (
              <motion.li
                key={item.src}
                layout
                className="mb-4 break-inside-avoid sm:mb-5"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.4 }}
              >
                <button type="button" onClick={() => setOpenIndex(i)} className="group block w-full overflow-hidden rounded-md" aria-label={`Open photo: ${item.alt}`}>
                  <img src={item.src} alt={item.alt} width={item.width} height={item.height} loading="lazy" className="w-full object-cover transition duration-700 ease-out group-hover:scale-105" />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </div>

      <Modal open={current !== null} onClose={close} label="Photo viewer" tone="dark">
        {current && (
          <figure className="flex flex-col items-center">
            <img src={current.src} alt={current.alt} className="max-h-[78vh] w-auto rounded-md object-contain" />
            <figcaption className="mt-4 flex w-full max-w-3xl items-center justify-between gap-4 text-ivory/80">
              <button type="button" onClick={() => step(-1)} aria-label="Previous photo" className="grid size-11 place-items-center rounded bg-ivory/10 hover:bg-ivory/20">
                <ChevronLeft size={22} aria-hidden="true" />
              </button>
              <span className="text-center text-[0.98rem]">
                {current.category}: {current.alt}
              </span>
              <button type="button" onClick={() => step(1)} aria-label="Next photo" className="grid size-11 place-items-center rounded bg-ivory/10 hover:bg-ivory/20">
                <ChevronRight size={22} aria-hidden="true" />
              </button>
            </figcaption>
          </figure>
        )}
      </Modal>
    </section>
  );
}
