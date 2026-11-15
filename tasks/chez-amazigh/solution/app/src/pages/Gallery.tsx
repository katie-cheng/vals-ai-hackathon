import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { galleryOrder, photos, type PhotoGroup } from "../config/gallery";
import { useLang } from "../i18n/LanguageContext";
import PageIntro from "../components/PageIntro";
import PageMeta from "../components/PageMeta";
import Photo from "../components/Photo";

type Filter = "all" | PhotoGroup;
const FILTERS: Filter[] = ["all", "house", "rooms", "table", "garden"];

export default function Gallery() {
  const { t, dir } = useLang();
  const g = t.gallery;
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const list = galleryOrder.filter((k) => filter === "all" || photos[k].group === filter);

  const step = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + list.length) % list.length)), [list.length]);
  const close = useCallback(() => {
    setOpen(null);
    lastFocus.current?.focus();
  }, []);

  useEffect(() => {
    if (open === null) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(dir === "rtl" ? -1 : 1);
      if (e.key === "ArrowLeft") step(dir === "rtl" ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    document.body.classList.add("menu-open");
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("menu-open");
    };
  }, [open, close, step, dir]);

  const current = open === null ? null : list[open];
  return (
    <>
      <PageMeta page="gallery" />
      <PageIntro title={g.title} lead={g.lead}>
        <p className="note">{t.common.photoCredit}</p>
      </PageIntro>
      <section className="section gallery">
        <div className="gallery-filters" role="group" aria-label={g.title}>
          {FILTERS.map((f) => (
            <button key={f} type="button" aria-pressed={filter === f} className={filter === f ? "is-current" : ""} onClick={() => setFilter(f)}>
              {g.filters[f]}
            </button>
          ))}
        </div>
        <ul className="gallery-grid">
          {list.map((k, i) => (
            <li key={k} className={photos[k].height > photos[k].width ? "tall" : photos[k].width / photos[k].height > 1.8 ? "wide" : ""}>
              <button
                type="button"
                className="gallery-item"
                aria-label={`${g.open}: ${g.captions[k]}`}
                onClick={(e) => {
                  lastFocus.current = e.currentTarget;
                  setOpen(i);
                }}
              >
                <Photo name={k} />
              </button>
              <p className="caption">{g.captions[k]}</p>
            </li>
          ))}
        </ul>
      </section>
      {current && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={g.captions[current]} onClick={(e) => e.target === e.currentTarget && close()}>
          <button ref={closeRef} type="button" className="lightbox-close" aria-label={g.close} onClick={close}><X size={26} aria-hidden="true" /></button>
          <button type="button" className="lightbox-prev" aria-label={g.prev} onClick={() => step(-1)}><ChevronLeft size={30} aria-hidden="true" className="flip" /></button>
          <figure>
            <img src={photos[current].src} width={photos[current].width} height={photos[current].height} alt={g.captions[current]} />
            <figcaption>
              {g.captions[current]}. {g.count.replace("{n}", String(open! + 1)).replace("{total}", String(list.length))}
            </figcaption>
          </figure>
          <button type="button" className="lightbox-next" aria-label={g.next} onClick={() => step(1)}><ChevronRight size={30} aria-hidden="true" className="flip" /></button>
        </div>
      )}
    </>
  );
}
