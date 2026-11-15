import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Plus, Star } from "lucide-react";
import { formatRand, useStore } from "../lib/store";

/** Motion tokens shared by every animated element (see DESIGN-SYSTEM.md). */
export const EASE = [0.16, 1, 0.3, 1] as const;
export const DUR = { base: 0.3, slow: 0.5 };

/** Scroll entrance: opacity only, so nothing moves and the layout never shifts. */
export function Reveal({ children, className = "" }: any) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0 }}
      whileInView={reduced ? undefined : { opacity: 1 }}
      viewport={{ once: true, amount: 0.14 }}
      transition={{ duration: DUR.slow, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
export function SectionHeading({ title, text, light = false }: any) {
  return (
    <div className="max-w-2xl">
      <h2 className={`display-title ${light ? "text-white" : "text-black"}`}>{title}</h2>
      {text && <p className={`mt-3 text-[15px] leading-7 ${light ? "text-white/70" : "text-neutral-600"}`}>{text}</p>}
    </div>
  );
}
export function PageHero({ title, text, image }: any) {
  return (
    <section className="relative overflow-hidden bg-black pt-36 pb-12 text-white sm:pt-40 sm:pb-14">
      {image && (
        <div
          className="absolute inset-0 opacity-30"
          style={{ backgroundImage: `url(${image})`, backgroundSize: "cover", backgroundPosition: "72% center" }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/30" />
      <div className="container-site relative">
        <h1 className="page-title max-w-3xl">{title}</h1>
        <p className="mt-3 max-w-xl text-[15px] leading-7 text-white/75">{text}</p>
      </div>
    </section>
  );
}
export function Stars({ rating, size = 15 }: any) {
  return (
    <div className="flex gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((o) => (
        <Star
          key={o}
          size={size}
          className={o <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-neutral-300 text-neutral-300"}
        />
      ))}
    </div>
  );
}
export function MenuCard({ item, compact = false }: any) {
  const { openItem } = useStore();
  return (
    <article className={`card relative flex h-full overflow-hidden ${compact ? "flex-row" : "flex-col"}`}>
      <button
        onClick={() => openItem(item)}
        className={`skeleton relative overflow-hidden text-left ${compact ? "w-32 shrink-0 sm:w-40" : "aspect-[1.3] w-full"}`}
        aria-label={`Customise ${item.name}`}
      >
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover"
          style={{
            objectPosition: item.category === "sides" && item.image.includes("chips") ? "center" : "72% center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        {!item.available && <span className="tag absolute top-3 left-3 bg-black text-white">Sold out</span>}
      </button>
      <div className={`flex flex-1 flex-col ${compact ? "p-4" : "p-5"}`}>
        <button onClick={() => openItem(item)} className="text-left">
          <h3 className={`font-display leading-tight font-semibold uppercase ${compact ? "text-lg" : "text-xl"}`}>
            {item.name}
          </h3>
          <p className={`mt-1.5 line-clamp-2 text-[13px] leading-5 text-neutral-600 ${compact ? "" : "min-h-10"}`}>
            {item.description}
          </p>
        </button>
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className="text-base font-semibold">{formatRand(item.price)}</span>
          <button
            disabled={!item.available}
            onClick={() => openItem(item)}
            className="btn-dark btn-sm"
            aria-label={`Add ${item.name} to cart`}
          >
            <Plus size={15} />
            <span className={compact ? "hidden sm:inline" : ""}>Add to cart</span>
          </button>
        </div>
      </div>
    </article>
  );
}
export function EmptyState({ title, text, action = "/menu", actionLabel = "Explore the menu", onAction }: any) {
  return (
    <div className="rounded-lg border border-dashed border-black/15 bg-white px-6 py-14 text-center">
      <h3 className="font-display text-2xl font-semibold uppercase">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-600">{text}</p>
      {onAction ? (
        <button onClick={onAction} className="btn-primary mt-6">
          {actionLabel}
        </button>
      ) : (
        <Link to={action} className="btn-primary mt-6">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
