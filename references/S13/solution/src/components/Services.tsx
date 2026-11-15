import * as React from "react";
import { services } from "../data/content";
import { EASE, Reveal, SplitWords, Tilt } from "../lib/anim";
import { Bubbles, DropletsFx } from "../lib/fx";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
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

function ServiceVisual({ visual: a }) {
  switch (a) {
    case "pressure":
      return (
        <>
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            aria-hidden
          >
            {Array.from({
              length: 9,
            }).map((i, r) => (
              <span
                key={r}
                className="animate-drip absolute top-6 rounded-full bg-white/70"
                style={{
                  left: `${8 + r * 10.5}%`,
                  width: 3,
                  height: 46 + ((r * 29) % 40),
                  animationDelay: `${(r * 0.37) % 3}s`,
                }}
              />
            ))}
          </div>
        </>
      );
    case "exterior-window":
      return (
        <>
          <DropletsFx count={12} />
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            aria-hidden
          >
            <motion.div
              className="absolute left-[12%] top-[8%] h-[70%] w-1.5 rounded-full bg-white/70"
              animate={{
                x: [0, 190, 0],
                rotate: [-4, 3, -4],
              }}
              transition={{
                duration: 7,
                repeat: 1 / 0,
                ease: "easeInOut",
              }}
            >
              <span className="absolute -left-2 top-0 h-10 w-5 rounded bg-cyan-200/90" />
            </motion.div>
          </div>
        </>
      );
    case "interior-window":
      return (
        <>
          <motion.div
            className="pointer-events-none absolute inset-0 bg-sky-100/50 backdrop-blur-[1.5px]"
            animate={{
              opacity: [0.85, 0.12, 0.85],
            }}
            transition={{
              duration: 8,
              repeat: 1 / 0,
              ease: "easeInOut",
            }}
            aria-hidden
          />
          <DropletsFx count={6} className="opacity-50" />
        </>
      );
    case "gutter":
      return (
        <>
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 top-[46%] overflow-hidden"
            aria-hidden
          >
            <div className="absolute inset-x-0 top-6 h-10 rounded-full border-y-4 border-white/25 bg-slate-500/60" />
            <motion.div
              className="absolute inset-x-[-50%] top-[38px] h-2 opacity-80"
              style={{
                background:
                  "repeating-linear-gradient(90deg, rgba(125,211,252,.9) 0 26px, rgba(255,255,255,.75) 26px 40px, rgba(125,211,252,.9) 40px 66px)",
              }}
              animate={{
                x: ["0%", "6%"],
              }}
              transition={{
                duration: 0.9,
                repeat: 1 / 0,
                ease: "linear",
              }}
            />
            {Array.from({
              length: 5,
            }).map((i, r) => (
              <svg
                key={r}
                className="animate-leaf absolute top-7"
                style={{
                  animationDelay: `${r * 1.35}s`,
                  animationDuration: `${6 + (r % 3)}s`,
                }}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill={r % 2 ? "#bef264" : "#4ade80"}
              >
                <path
                  d="M12 2C7 7 5 12 6 20c8 1 13-1 15-9 1.4-5.6-3-9-9-9zm0 0c-2 4-3 8-2.5 13M12 2c2.5 3.5 3.5 7.5 3 12"
                  stroke="#166534"
                  strokeWidth="1"
                  fillOpacity=".9"
                />
              </svg>
            ))}
          </div>
          <Bubbles count={10} minSize={2} maxSize={10} />
        </>
      );
    case "house":
      return (
        <>
          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 90% 60% at 30% 70%, rgba(101,67,33,.5), transparent 60%), radial-gradient(ellipse 70% 50% at 75% 30%, rgba(74,90,46,.45), transparent 60%)",
            }}
            animate={{
              opacity: [0.95, 0.05, 0.95],
            }}
            transition={{
              duration: 9,
              repeat: 1 / 0,
              ease: "easeInOut",
            }}
            aria-hidden
          />
          <DropletsFx count={8} className="opacity-60" />
        </>
      );
    default:
      return (
        <>
          <motion.div
            className="pointer-events-none absolute inset-0 bg-white/15"
            animate={{
              opacity: [0.2, 0.9, 0.2],
              x: ["-12%", "12%", "-12%"],
            }}
            transition={{
              duration: 7,
              repeat: 1 / 0,
              ease: "easeInOut",
            }}
            aria-hidden
          />
          <motion.div
            className="pointer-events-none absolute bottom-6 left-6 right-6 h-1.5 rounded-full bg-white/10"
            aria-hidden
          >
            <motion.div
              className="h-full rounded-full bg-cyan-300"
              animate={{
                x: ["-100%", "320%"],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3.4,
                repeat: 1 / 0,
                ease: "easeInOut",
              }}
              style={{
                width: "30%",
              }}
            />
          </motion.div>
          <Bubbles count={8} minSize={2} maxSize={9} />
        </>
      );
  }
}

function ServicePanel({ index: a }: { index: number }) {
  const i = services[a],
    l = React.useRef(null),
    { scrollYProgress: u } = useScroll({
      target: l,
      offset: ["start end", "end start"],
    }),
    h = useTransform(u, [0, 1], ["-8%", "8%"]);
  return (
    <div ref={l} className="persp">
      <Tilt
        max={5}
        className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.07] backdrop-blur-xl"
      >
        <div className="grid gap-0 lg:grid-cols-2">
          <div className="relative min-h-[300px] overflow-hidden lg:min-h-[420px]">
            <motion.img
              src={i.image_url}
              alt={i.image_alt}
              style={{
                y: h,
              }}
              className="absolute inset-0 h-[116%] w-full scale-105 object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-[#04141f]/60 " />
            <ServiceVisual visual={i.visual} />
          </div>
          <div className="relative flex flex-col justify-center gap-5 p-7 sm:p-10">
            <span
              className="font-serif-d pointer-events-none absolute right-6 top-4 text-[5.5rem] font-bold leading-none text-white/[0.06] transition-colors duration-500 group-hover:text-cyan-300/10"
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
            <div className="mt-1">
              <a
                href="#quote"
                className="group/btn inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13.5px] font-black text-[#04141f] transition-all duration-300 hover:bg-cyan-300"
              >
                {i.quote_label}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </a>
            </div>
          </div>
        </div>
        <div
          className="pointer-events-none absolute inset-0 rounded-[2rem] opacity-0 ring-1 ring-inset ring-cyan-300/40 transition-opacity duration-500 group-hover:opacity-100"
          aria-hidden
        />
      </Tilt>
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
          const Icon = SERVICE_ICONS[k % SERVICE_ICONS.length],
            on = k === active;
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
              className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2.5 text-[13.5px] font-semibold transition-all duration-300 ${on ? "border-cyan-300 bg-cyan-300 text-[#04141f]" : "border-white/15 bg-white/5 text-sky-100/80 hover:border-cyan-300/50 hover:text-white"}`}
            >
              <Icon className={`h-4 w-4 ${on ? "text-[#04141f]" : "text-cyan-300"}`} />
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
      <Bubbles count={14} className="opacity-50" />
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

export { SERVICE_ICONS, ServiceVisual, ServicePanel, ServiceSwitcher, Services };
