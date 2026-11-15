import * as React from "react";
import { services } from "../data/content";
import { EASE, Reveal, SplitWords } from "../lib/anim";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Droplets,
  House,
  Sparkles,
  Sun,
  Waves,
} from "lucide-react";

const SERVICE_ICONS = [Waves, Sun, Sparkles, Droplets, House, Building2];

function ServicePanel({ index: a }: { index: number }) {
  const i = services[a],
    l = React.useRef(null);
  return (
    <div ref={l} className="persp">
      <div
        className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.07] backdrop-blur-xl"
      >
        <div className="grid gap-0 lg:grid-cols-2">
          <div className="relative min-h-[300px] overflow-hidden lg:min-h-[420px]">
            <img
              src={i.image_url}
              alt={i.image_alt}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-[#04141f]/60 " />
          </div>
          <div className="relative flex flex-col justify-center gap-5 p-7 sm:p-10">
            <span
              className="font-serif-d pointer-events-none absolute right-6 top-4 text-[5.5rem] font-medium leading-none text-white/[0.06] transition-colors duration-500 group-hover:text-cyan-300/10"
              aria-hidden
            >
              {String(a + 1).padStart(2, "0")}
            </span>
            <h3 className="font-serif-d text-2xl font-medium leading-tight text-white sm:text-[1.9rem]">
              {i.name}
            </h3>
            <p className="text-[15px] leading-relaxed text-sky-100/75">
              {i.description}
            </p>
            <p className="text-[13.5px] leading-snug text-sky-200/70">
              {i.price_note}
            </p>
          </div>
        </div>
        <div
          className="pointer-events-none absolute inset-0 rounded-lg opacity-0 ring-1 ring-inset ring-cyan-300/40 transition-opacity duration-500 group-hover:opacity-100"
          aria-hidden
        />
      </div>
    </div>
  );
}

function ServiceSwitcher() {
  const [active, setActive] = React.useState(0),
    [dir, setDir] = React.useState(1),
    n = services.length,
    tabs = React.useRef<(HTMLButtonElement | null)[]>([]),
    swipe = React.useRef<{ x: number; y: number } | null>(null),
    go = (k: number, focus = false) => {
      const next = (k + n) % n;
      setDir(next > active || (active === n - 1 && next === 0) ? 1 : -1);
      setActive(next);
      if (focus) tabs.current[next]?.focus();
    };
  React.useEffect(() => {
    services.forEach((sv) => {
      new Image().src = sv.image_url;
    });
  }, []);
  return (
    <Reveal>
      <div
        role="tablist"
        aria-label="Cleaning services"
        className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") (e.preventDefault(), go(active + 1, true));
          if (e.key === "ArrowLeft") (e.preventDefault(), go(active - 1, true));
        }}
      >
        {services.map((sv, k) => {
          const on = k === active;
          return (
            <button
              key={sv.slug}
              ref={(el) => {
                tabs.current[k] = el;
              }}
              id={`service-tab-${sv.slug}`}
              role="tab"
              aria-selected={on}
              aria-controls="service-panel"
              tabIndex={on ? 0 : -1}
              onClick={() => go(k)}
              className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md border px-4 py-2.5 text-[13.5px] font-semibold transition-all duration-300 ${on ? "border-cyan-300 bg-cyan-300 text-[#04141f]" : "border-white/15 bg-white/5 text-sky-100/80 hover:border-cyan-300/50 hover:text-white"}`}
            >
              {sv.name}
            </button>
          );
        })}
      </div>
      <div
        id="service-panel"
        role="tabpanel"
        aria-labelledby={`service-tab-${services[active].slug}`}
        className="relative"
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse") swipe.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerUp={(e) => {
          const s0 = swipe.current;
          swipe.current = null;
          if (!s0) return;
          const dx = e.clientX - s0.x;
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(e.clientY - s0.y))
            go(active + (dx < 0 ? 1 : -1));
        }}
      >
        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.div
            key={active}
            custom={dir}
            initial={{ opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -40 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <ServicePanel index={active} />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-[13.5px] font-semibold text-sky-200/70" aria-live="polite">
          {active + 1} of {n}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => go(active - 1)}
            aria-label="Previous service"
            className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/5 text-white transition hover:border-cyan-300/60 hover:bg-cyan-300/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => go(active + 1)}
            aria-label="Next service"
            className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/5 text-white transition hover:border-cyan-300/60 hover:bg-cyan-300/10"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </Reveal>
  );
}

function Services() {
  return (
    <section id="services" className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
      </div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-14 max-w-3xl sm:mb-20">
          <SplitWords
            text="The right clean for every part of your home."
            as="h2"
            className="font-serif-d block text-[1.9rem] font-medium leading-tight text-white sm:text-[2.6rem]"
          />
          <Reveal delay={0.25}>
            <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-sky-100/75">
              Different materials need different treatment. Choose a service to
              see what is included, how pricing works, and what to tell us when
              you request an estimate.
            </p>
          </Reveal>
        </div>
        <ServiceSwitcher />
      </div>
    </section>
  );
}

export { SERVICE_ICONS, ServicePanel, ServiceSwitcher, Services };
