import React from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Clock3,
  Flame,
  Heart,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  UsersRound,
} from "lucide-react";
import { MenuCard, Reveal, SectionHeading, Stars } from "../components/UI";
import { formatRand, useStore } from "../lib/store";

export function Home() {
  const { data, openItem } = useStore();
  const [o, r] = React.useState(0);
  const [c, d] = React.useState(false);
  const f = useReducedMotion();
  const m = data.heroSlides[o] || data.heroSlides[0];
  React.useEffect(() => {
    if (c || f || data.heroSlides.length < 2) return;
    const S = setInterval(() => r((w) => (w + 1) % data.heroSlides.length), 6500);
    return () => clearInterval(S);
  }, [c, f, data.heroSlides.length]);
  const x = data.items.filter((S) => S.available && (S.featured || S.popular)).slice(0, 8);
  const v = data.reviews.filter((S) => S.status === "approved").slice(0, 3);
  const g = data.items.find((S) => S.id === "combo-solo");
  const y = encodeURIComponent(data.settings.address);
  return m ? (
    <>
      <section
        className="relative min-h-[760px] h-[100svh] overflow-hidden bg-black text-white"
        onMouseEnter={() => d(true)}
        onMouseLeave={() => d(false)}
      >
        <AnimatePresence mode="sync">
          <motion.div
            key={m.id}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <motion.img
              src={m.image}
              alt="Rocksteady Campus freshly prepared takeaway"
              className="h-full w-full object-cover"
              style={{ objectPosition: "center" }}
              initial={f ? false : { scale: 1.06 }}
              animate={{ scale: 1 }}
              transition={{ duration: 7, ease: "linear" }}
              fetchPriority="high"
            />
          </motion.div>
        </AnimatePresence>
        <div className="hero-vignette absolute inset-0" />
        <div className="absolute inset-y-0 left-0 hidden w-12 items-center justify-center border-r border-white/10 lg:flex">
          <span className="rotate-180 text-[9px] font-bold tracking-[.4em] text-white/35 uppercase [writing-mode:vertical-rl]">
            Rockville · Soweto · Est. with love
          </span>
        </div>
        <div className="container-site relative flex h-full flex-col justify-center pt-24 pb-44 sm:pb-40 lg:pl-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={m.id}
              className="max-w-[790px]"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="eyebrow text-white">
                <span className="text-brand">{m.eyebrow}</span>
              </div>
              <h1 className="mt-6 font-display text-[54px] leading-[.88] font-black tracking-[-.025em] uppercase sm:text-7xl lg:text-[88px]">
                {m.title}
              </h1>
              <p className="mt-6 max-w-xl text-[13px] leading-6 text-white/65 sm:text-[15px] sm:leading-7">{m.text}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/order" className="btn-primary">
                  {data.content.homeHeroPrimary}
                  <ArrowRight size={16} />
                </Link>
                <Link to="/menu" className="btn-white">
                  {data.content.homeHeroSecondary}
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
          <motion.div
            className="absolute bottom-28 left-5 hidden items-center gap-5 sm:flex lg:left-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center gap-3 border-r border-white/15 pr-5">
              <div className="flex -space-x-2">
                {["NM", "SK", "TR"].map((S, w) => (
                  <span
                    key={S}
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-black text-[9px] font-bold ${w === 1 ? "bg-brand" : "bg-neutral-700"}`}
                  >
                    {S}
                  </span>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 text-xs font-bold">
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  4.9
                </div>
                <span className="text-[9px] text-white/45 uppercase">Local favourite</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold">Made fresh</p>
              <span className="text-[9px] text-white/45 uppercase">Every single order</span>
            </div>
          </motion.div>
        </div>
        <div className="absolute right-5 bottom-8 left-5 flex items-end justify-between gap-5 sm:right-8 sm:bottom-10 sm:left-8 lg:right-12 lg:left-auto">
          <a
            href="#categories"
            className="hidden h-12 w-12 items-center justify-center rounded-full border border-white/20 text-white/60 transition hover:bg-white hover:text-black lg:flex"
            aria-label="Scroll to categories"
          >
            <ArrowDown size={18} />
          </a>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => r((o - 1 + data.heroSlides.length) % data.heroSlides.length)}
              className="mr-1 hidden h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/70 transition hover:bg-white hover:text-black sm:flex"
              aria-label="Previous hero slide"
            >
              <ArrowLeft size={16} />
            </button>
            {data.heroSlides.map((S, w) => (
              <button
                key={S.id}
                onClick={() => r(w)}
                className={`relative h-14 w-14 overflow-hidden rounded-lg border transition duration-300 sm:h-16 sm:w-20 ${w === o ? "border-brand shadow-[0_0_0_2px_rgba(241,0,31,.3)]" : "border-white/20 opacity-55 hover:opacity-100"}`}
                aria-label={`Show slide ${w + 1}`}
              >
                <img
                  src={S.image}
                  alt=""
                  className="h-full w-full object-cover"
                  style={{ objectPosition: "72% center" }}
                />
                {w === o && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand" />}
              </button>
            ))}
            <button
              onClick={() => r((o + 1) % data.heroSlides.length)}
              className="ml-1 hidden h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/70 transition hover:bg-white hover:text-black sm:flex"
              aria-label="Next hero slide"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>
      <div className="overflow-hidden bg-brand py-3 text-white">
        <div className="marquee-track flex w-max items-center gap-8 whitespace-nowrap font-display text-lg font-bold tracking-wider uppercase">
          {Array.from({ length: 8 }).map((S, w) => (
            <span key={w} className="flex items-center gap-8">
              {"Big flavour "}
              <Sparkles size={15} />
              {" Generous portions "}
              <Sparkles size={15} />
              {" Real township taste "}
              <Sparkles size={15} />
            </span>
          ))}
        </div>
      </div>
      <section id="categories" className="paper-texture py-20 sm:py-28">
        <div className="container-site">
          <Reveal>
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <SectionHeading
                eyebrow={data.content.categoriesEyebrow}
                title={data.content.categoriesTitle}
                text={data.content.categoriesText}
              />
              <Link to="/menu" className="btn-outline shrink-0">
                View full menu
                <ArrowRight size={15} />
              </Link>
            </div>
          </Reveal>
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8 lg:gap-4">
            {[...data.categories]
              .sort((S, w) => S.order - w.order)
              .map((S, w) => (
                <Reveal key={S.id} delay={w * 0.045}>
                  <Link to={`/menu?category=${S.id}`} className="group block text-center">
                    <div className="relative mx-auto aspect-square overflow-hidden rounded-2xl bg-black shadow-sm transition duration-500 group-hover:-translate-y-2 group-hover:shadow-xl">
                      <img
                        src={S.image}
                        alt={S.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                        style={{ objectPosition: "72% center" }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                      <span className="absolute right-2 bottom-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-black opacity-0 transition group-hover:opacity-100">
                        <ArrowRight size={13} />
                      </span>
                    </div>
                    <h3 className="mt-3 font-display text-lg leading-tight font-bold uppercase sm:text-xl">{S.name}</h3>
                    <p className="mt-1 hidden text-[10px] text-neutral-500 sm:block">
                      {data.items.filter((C) => C.category === S.id).length}
                      {" options"}
                    </p>
                  </Link>
                </Reveal>
              ))}
          </div>
        </div>
      </section>
      <section className="bg-white py-20 sm:py-28">
        <div className="container-site">
          <Reveal>
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <SectionHeading
                eyebrow={data.content.bestsellersEyebrow}
                title={data.content.bestsellersTitle}
                text={data.content.bestsellersText}
              />
              <Link
                to="/menu"
                className="group flex items-center gap-2 text-xs font-extrabold tracking-wider uppercase"
              >
                See everything
                <ArrowRight size={16} className="text-brand transition group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {x.slice(0, 4).map((S, w) => (
              <Reveal key={S.id} delay={w * 0.08}>
                <MenuCard item={S} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="relative overflow-hidden bg-brand py-16 text-white sm:py-20">
        <div className="absolute inset-y-0 right-0 hidden w-[48%] lg:block">
          <img
            src={data.images.promo}
            alt="Campus Classic Kota promotion"
            className="h-full w-full object-cover"
            style={{ objectPosition: "72% center" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand via-brand/25 to-transparent" />
        </div>
        <div className="absolute -bottom-24 left-[42%] font-display text-[18rem] leading-none font-black text-white/10 select-none">
          R58
        </div>
        <div className="container-site relative">
          <Reveal>
            <div className="max-w-2xl">
              <div className="eyebrow !text-white before:!bg-white">{data.content.promoEyebrow}</div>
              <h2 className="display-title mt-5">{data.content.promoTitle}</h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-white/80 sm:text-base">{data.content.promoText}</p>
              <div className="mt-7 flex flex-wrap items-center gap-5">
                {g && (
                  <button
                    onClick={() => openItem(g)}
                    className="inline-flex min-h-12 items-center gap-2 rounded-full bg-black px-7 text-[12px] font-extrabold tracking-wider text-white uppercase transition hover:scale-[1.02]"
                  >
                    {data.content.promoButton}
                    <ArrowRight size={15} />
                  </button>
                )}
                <span className="font-display text-2xl font-bold">
                  {"Only "}
                  {formatRand(g?.price || 58)}
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
      <section className="bg-cream py-20 sm:py-28">
        <div className="container-site">
          <Reveal>
            <SectionHeading
              eyebrow={data.content.whyEyebrow}
              title={data.content.whyTitle}
              text={data.content.whyText}
              align="center"
            />
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              { icon: Flame, title: data.content.whyOneTitle, text: data.content.whyOneText, number: "01" },
              { icon: Heart, title: data.content.whyTwoTitle, text: data.content.whyTwoText, number: "02" },
              { icon: UsersRound, title: data.content.whyThreeTitle, text: data.content.whyThreeText, number: "03" },
            ].map((S, w) => (
              <Reveal key={S.number} delay={w * 0.1}>
                <div className="group relative h-full overflow-hidden rounded-3xl bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                  <span className="absolute top-4 right-6 font-display text-7xl font-black text-black/[.035]">
                    {S.number}
                  </span>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-brand transition group-hover:bg-brand group-hover:text-white">
                    <S.icon size={22} />
                  </div>
                  <h3 className="mt-7 font-display text-2xl font-bold uppercase">{S.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-neutral-500">{S.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-black py-20 text-white sm:py-28">
        <div className="container-site">
          <Reveal>
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <SectionHeading
                light
                eyebrow={data.content.reviewsEyebrow}
                title={data.content.reviewsTitle}
                text={data.content.reviewsText}
              />
              <Link to="/reviews" className="btn-white shrink-0">
                Read all reviews
                <ArrowRight size={15} />
              </Link>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {v.map((S, w) => (
              <Reveal key={S.id} delay={w * 0.09}>
                <article className="h-full rounded-3xl border border-white/10 bg-white/[.045] p-7">
                  <Stars rating={S.rating} />
                  <blockquote className="mt-5 text-sm leading-7 text-white/70">“{S.text}”</blockquote>
                  <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand font-display text-lg font-bold">
                      {S.name.charAt(0)}
                    </span>
                    <div>
                      <p className="text-sm font-bold">{S.name}</p>
                      <p className="text-[10px] text-white/40 uppercase">Verified local customer</p>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-white py-20 sm:py-28">
        <div className="container-site grid items-stretch gap-10 lg:grid-cols-[.85fr_1.15fr]">
          <Reveal>
            <div className="flex h-full flex-col justify-center">
              <SectionHeading
                eyebrow={data.content.locationEyebrow}
                title={data.content.locationTitle}
                text={data.content.locationText}
              />
              <div className="mt-8 space-y-5">
                <p className="flex gap-3 text-sm leading-6 text-neutral-600">
                  <MapPin size={20} className="mt-1 shrink-0 text-brand" />
                  {data.settings.address}
                </p>
                <p className="flex gap-3 text-sm leading-6 text-neutral-600">
                  <Clock3 size={20} className="shrink-0 text-brand" />
                  <span>
                    {data.settings.hoursWeek}
                    <br />
                    {data.settings.hoursSunday}
                  </span>
                </p>
                <a
                  href={`tel:${data.settings.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-3 text-sm font-bold hover:text-brand"
                >
                  <Phone size={20} className="text-brand" />
                  {data.settings.phone}
                </a>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/contact" className="btn-dark">
                  Get directions
                  <ArrowRight size={15} />
                </Link>
                <Link to="/order" className="btn-outline">
                  Order collection
                </Link>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="relative min-h-[420px] overflow-hidden rounded-3xl bg-neutral-200 shadow-xl">
              <iframe
                title="Rocksteady Campus location in Rockville, Soweto"
                src={`https://www.google.com/maps?q=${y}&output=embed`}
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="pointer-events-none absolute top-5 left-5 rounded-xl bg-black px-4 py-3 text-white shadow-lg">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <ShieldCheck size={15} className="text-brand" />
                  1563 Makapane Street
                </div>
                <p className="mt-1 text-[10px] text-white/50">Rockville, Soweto</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  ) : null;
}
