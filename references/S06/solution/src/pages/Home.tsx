import React from "react";
import { Link } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { MenuCard, Reveal, SectionHeading, Stars } from "../components/UI";
import { useStore } from "../lib/store";

const SLIDE_MS = 6500;

export function Home() {
  const { data, openItem } = useStore();
  const [slide, setSlide] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const reduced = useReducedMotion();
  const slides = data.heroSlides;
  const current = slides[slide] || slides[0];
  React.useEffect(() => {
    if (paused || reduced || slides.length < 2) return;
    const timer = setInterval(() => setSlide((index) => (index + 1) % slides.length), SLIDE_MS);
    return () => clearInterval(timer);
  }, [paused, reduced, slides.length]);

  // One favourite per photograph, so the row never shows the same picture four times.
  const favourites = React.useMemo(() => {
    const picked = [];
    const pool = data.items.filter((item) => item.available && (item.featured || item.popular));
    for (const item of pool) if (!picked.some((other) => other.image === item.image)) picked.push(item);
    for (const item of pool) if (picked.length < 4 && !picked.includes(item)) picked.push(item);
    return picked.slice(0, 4);
  }, [data.items]);
  const reviews = data.reviews.filter((review) => review.status === "approved").slice(0, 3);
  const combo = data.items.find((item) => item.id === "combo-solo");
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(data.settings.address)}`;
  const why = [
    { title: data.content.whyOneTitle, text: data.content.whyOneText },
    { title: data.content.whyTwoTitle, text: data.content.whyTwoText },
    { title: data.content.whyThreeTitle, text: data.content.whyThreeText },
  ];
  if (!current) return null;
  return (
    <>
      <section
        className="relative flex min-h-[max(76svh,600px)] flex-col overflow-hidden bg-black text-white"
        aria-roledescription="carousel"
        aria-label="Rocksteady Campus meals"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        {slides.map((item, index) => (
          <img
            key={item.id}
            src={item.image}
            alt={index === slide ? item.title : ""}
            aria-hidden={index !== slide}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${index === slide ? "opacity-100" : "opacity-0"}`}
            fetchPriority={index === 0 ? "high" : "low"}
            loading={index === 0 ? "eager" : "lazy"}
          />
        ))}
        <div className="hero-vignette absolute inset-0" />
        <div className="container-site relative flex flex-1 flex-col justify-center pt-36 pb-10">
          <div className="max-w-[620px]">
            {/* Every slide's copy sits in the same grid cell, so the tallest one sets the height and nothing moves when they crossfade. */}
            <div className="grid">
              {slides.map((item, index) => {
                const Title = index === 0 ? "h1" : "p";
                return (
                  <div
                    key={item.id}
                    aria-hidden={index !== slide}
                    className={`col-start-1 row-start-1 transition-opacity duration-700 ${index === slide ? "opacity-100" : "opacity-0"}`}
                  >
                    <Title className="font-display text-[44px] leading-[1] font-semibold uppercase sm:text-6xl lg:text-[68px]">
                      {item.title}
                    </Title>
                    <p className="mt-4 max-w-lg text-[15px] leading-7 text-white/80 sm:text-base">{item.text}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/order" className="btn-primary">
                {data.content.homeHeroPrimary}
                <ArrowRight size={16} />
              </Link>
              <Link to="/menu" className="btn-white">
                {data.content.homeHeroSecondary}
              </Link>
            </div>
          </div>
        </div>
        <div className="container-site relative pb-8">
          <div className="flex gap-2 sm:justify-end" role="group" aria-label="Choose a photograph">
            {slides.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setSlide(index)}
                className={`h-12 w-16 overflow-hidden rounded-md border-2 transition-opacity sm:h-14 sm:w-20 ${index === slide ? "border-white" : "border-transparent opacity-60 hover:opacity-100"}`}
                aria-label={`Show photograph ${index + 1} of ${slides.length}: ${item.title}`}
                aria-current={index === slide}
              >
                <img src={item.image} alt="" className="h-full w-full object-cover" style={{ objectPosition: "72% center" }} />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="categories" className="paper-texture section">
        <div className="container-site">
          <Reveal>
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <SectionHeading title={data.content.categoriesTitle} text={data.content.categoriesText} />
              <Link to="/menu" className="btn-outline shrink-0 self-start md:self-auto">
                View full menu
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4 lg:grid-cols-8">
              {[...data.categories]
                .sort((a, b) => a.order - b.order)
                .map((category) => (
                  <Link key={category.id} to={`/menu?category=${category.id}`} className="group block">
                    <div className="skeleton relative aspect-square overflow-hidden rounded-lg">
                      <img
                        src={category.image}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                        style={{ objectPosition: "72% center" }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                    </div>
                    <h3 className="mt-2.5 font-display text-lg leading-tight font-semibold uppercase group-hover:text-brand">
                      {category.name}
                    </h3>
                    <p className="text-[13px] text-neutral-600">
                      {data.items.filter((item) => item.category === category.id).length}
                      {" options"}
                    </p>
                  </Link>
                ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-site">
          <Reveal>
            <SectionHeading title={data.content.bestsellersTitle} text={data.content.bestsellersText} />
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {favourites.map((item) => (
                <MenuCard key={item.id} item={item} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative overflow-hidden bg-brand py-14 text-white sm:py-16">
        <div className="absolute inset-y-0 right-0 hidden w-[48%] lg:block">
          <img
            src={data.images.promo}
            alt="Campus Classic Kota"
            loading="lazy"
            className="h-full w-full object-cover"
            style={{ objectPosition: "72% center" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand via-brand/25 to-transparent" />
        </div>
        <div className="container-site relative">
          <Reveal className="max-w-md">
            <h2 className="display-title">{data.content.promoTitle}</h2>
            <p className="mt-3 text-[15px] leading-7 text-white/90">{data.content.promoText}</p>
            {combo && (
              <button onClick={() => openItem(combo)} className="btn-dark mt-6">
                {data.content.promoButton}
              </button>
            )}
          </Reveal>
        </div>
      </section>

      <section className="section bg-cream">
        <div className="container-site">
          <Reveal>
            <SectionHeading title={data.content.whyTitle} />
            <div className="mt-8 grid gap-x-8 md:grid-cols-3">
              {why.map((point) => (
                <div key={point.title} className="border-t border-black/15 py-5">
                  <h3 className="card-title">{point.title}</h3>
                  <p className="mt-2 text-[15px] leading-7 text-neutral-600">{point.text}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section bg-black text-white">
        <div className="container-site">
          <Reveal>
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <SectionHeading light title={data.content.reviewsTitle} text={data.content.reviewsText} />
              <Link to="/reviews" className="btn-white shrink-0 self-start md:self-auto">
                Read all reviews
              </Link>
            </div>
            <div className="mt-8 grid gap-x-8 md:grid-cols-3">
              {reviews.map((review) => (
                <figure key={review.id} className="flex flex-col border-t border-white/20 py-5">
                  <Stars rating={review.rating} />
                  <blockquote className="mt-4 flex-1 text-[15px] leading-7 text-white/85">“{review.text}”</blockquote>
                  <figcaption className="mt-4 text-sm">
                    <span className="block font-semibold">{review.name}</span>
                    {review.meal && <span className="block text-white/60">Ordered {review.meal}</span>}
                  </figcaption>
                </figure>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-site">
          <Reveal className="grid items-stretch gap-8 lg:grid-cols-12">
            <div className="flex flex-col justify-center lg:col-span-5">
              <SectionHeading title={data.content.locationTitle} text={data.content.locationText} />
              <dl className="rule-list mt-6 text-[15px] leading-7">
                <div className="grid grid-cols-[88px_1fr] gap-3 py-3">
                  <dt className="text-neutral-600">Address</dt>
                  <dd>{data.settings.address}</dd>
                </div>
                <div className="grid grid-cols-[88px_1fr] gap-3 py-3">
                  <dt className="text-neutral-600">Hours</dt>
                  <dd>
                    {data.settings.hoursWeek}
                    <br />
                    {data.settings.hoursSunday}
                  </dd>
                </div>
                <div className="grid grid-cols-[88px_1fr] gap-3 py-3">
                  <dt className="text-neutral-600">Phone</dt>
                  <dd>
                    <a href={`tel:${data.settings.phone.replace(/\s/g, "")}`} className="font-semibold hover:text-brand">
                      {data.settings.phone}
                    </a>
                  </dd>
                </div>
              </dl>
              <a href={directions} target="_blank" rel="noreferrer" className="btn-dark mt-6 self-start">
                Get directions
              </a>
            </div>
            <div className="skeleton relative min-h-[360px] overflow-hidden rounded-lg lg:col-span-7">
              <iframe
                title="Rocksteady Campus location in Rockville, Soweto"
                src={`https://www.google.com/maps?q=${encodeURIComponent(data.settings.address)}&output=embed`}
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
