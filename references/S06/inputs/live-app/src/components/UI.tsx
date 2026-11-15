import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Plus, Star } from "lucide-react";
import { formatRand, useStore } from "../lib/store";

export function Reveal({ children, className = "", delay = 0 }: any) {
  const r = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={r ? false : { opacity: 0, y: 32 }}
      whileInView={r ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.14 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
export function SectionHeading({ eyebrow, title, text, light = false, align = "left" }: any) {
  return (
    <div className={`${align === "center" ? "mx-auto text-center" : ""} max-w-3xl`}>
      <div className={`eyebrow ${align === "center" ? "justify-center before:hidden" : ""}`}>{eyebrow}</div>
      <h2 className={`display-title mt-5 ${light ? "text-white" : "text-black"}`}>{title}</h2>
      {text && (
        <p
          className={`mt-5 max-w-2xl text-[15px] leading-7 ${align === "center" ? "mx-auto" : ""} ${light ? "text-white/60" : "text-neutral-600"}`}
        >
          {text}
        </p>
      )}
    </div>
  );
}
export function PageHero({ eyebrow, title, text, image }: any) {
  return (
    <section className="relative overflow-hidden bg-black pt-36 pb-20 text-white sm:pt-44 sm:pb-24">
      {image && (
        <div
          className="absolute inset-0 opacity-30"
          style={{ backgroundImage: `url(${image})`, backgroundSize: "cover", backgroundPosition: "72% center" }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/30" />
      <div className="absolute -right-20 -bottom-24 font-display text-[18rem] leading-none font-black text-white/[.025] uppercase select-none">
        RSC
      </div>
      <div className="container-site relative">
        <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
          <div className="eyebrow">{eyebrow}</div>
          <h1 className="mt-5 max-w-5xl font-display text-6xl leading-[.9] font-black tracking-tight uppercase sm:text-7xl lg:text-8xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">{text}</p>
        </motion.div>
      </div>
    </section>
  );
}
export function Stars({ rating, size = 15 }: any) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((o) => (
        <Star
          key={o}
          size={size}
          className={o <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-neutral-200 text-neutral-200"}
        />
      ))}
    </div>
  );
}
export function MenuCard({ item, compact = false }: any) {
  const { openItem } = useStore();
  return (
    <motion.article
      layout
      className={`group relative flex overflow-hidden rounded-2xl border border-black/[.07] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,.10)] ${compact ? "flex-row" : "flex-col"}`}
    >
      <button
        onClick={() => openItem(item)}
        className={`relative overflow-hidden text-left ${compact ? "w-32 shrink-0 sm:w-40" : "aspect-[1.3] w-full"}`}
        aria-label={`Customise ${item.name}`}
      >
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          style={{
            objectPosition: item.category === "sides" && item.image.includes("chips") ? "center" : "72% center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {item.featured && (
            <span className="rounded-full bg-brand px-2.5 py-1 text-[9px] font-extrabold tracking-wider text-white uppercase">
              Featured
            </span>
          )}
          {!item.available && (
            <span className="rounded-full bg-black px-2.5 py-1 text-[9px] font-extrabold tracking-wider text-white uppercase">
              Sold out
            </span>
          )}
        </div>
      </button>
      <div className={`flex flex-1 flex-col ${compact ? "p-4" : "p-5"}`}>
        <button onClick={() => openItem(item)} className="text-left">
          <h3 className={`${compact ? "text-base" : "text-xl"} font-display font-bold uppercase tracking-wide`}>
            {item.name}
          </h3>
          <p
            className={`mt-2 leading-5 text-neutral-500 ${compact ? "line-clamp-2 text-xs" : "line-clamp-2 min-h-10 text-[13px]"}`}
          >
            {item.description}
          </p>
        </button>
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <span className="font-display text-2xl font-bold">{formatRand(item.price)}</span>
          <button
            disabled={!item.available}
            onClick={() => openItem(item)}
            className="flex h-10 items-center gap-2 rounded-full bg-black px-4 text-[10px] font-extrabold tracking-wider text-white uppercase transition hover:bg-brand disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={`Add ${item.name} to cart`}
          >
            <Plus size={15} /> <span className={compact ? "hidden sm:inline" : ""}>Add</span>
          </button>
        </div>
      </div>
    </motion.article>
  );
}
export function EmptyState({ title, text, action = "/menu", actionLabel = "Explore the menu", onAction }: any) {
  return (
    <div className="rounded-3xl border border-dashed border-black/15 bg-white px-6 py-16 text-center">
      <h3 className="font-display text-3xl font-bold uppercase">{title}</h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-neutral-500">{text}</p>
      {onAction ? (
        <button onClick={onAction} className="btn-primary mt-6">
          {actionLabel}
          <ArrowRight size={15} />
        </button>
      ) : (
        <Link to={action} className="btn-primary mt-6">
          {actionLabel}
          <ArrowRight size={15} />
        </Link>
      )}
    </div>
  );
}
