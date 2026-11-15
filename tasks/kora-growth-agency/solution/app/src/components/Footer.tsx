import { Reveal, SplitText } from "./motion";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUp, ArrowUpRight } from "lucide-react";
import { Logo } from "./Nav";

const footerColumns = [
  {
    title: "Studio",
    links: [
      {
        to: "/about",
        label: "About us",
      },
      {
        to: "/work",
        label: "Case studies",
      },
      {
        to: "/insights",
        label: "Insights",
      },
      {
        to: "/pricing",
        label: "Pricing",
      },
      {
        to: "/contact",
        label: "Contact",
      },
    ],
  },
  {
    title: "Services",
    links: [
      {
        to: "/services/growth-strategy",
        label: "Growth Strategy",
      },
      {
        to: "/services/revenue-operations",
        label: "Revenue Operations",
      },
      {
        to: "/services/brand-positioning",
        label: "Brand & Positioning",
      },
      {
        to: "/services/performance-marketing",
        label: "Performance Marketing",
      },
      {
        to: "/services",
        label: "All services",
      },
    ],
  },
  {
    title: "Socials",
    links: [
      {
        to: "/contact",
        label: "LinkedIn",
      },
      {
        to: "/contact",
        label: "X / Twitter",
      },
      {
        to: "/contact",
        label: "Instagram",
      },
      {
        to: "/contact",
        label: "YouTube",
      },
    ],
  },
];
export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-pine-950 text-cream-50">
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-50" />
      <div className="container-x relative pt-20 pb-4 sm:pt-28">
        <div className="flex flex-col items-start justify-between gap-8 border-b border-cream-50/10 pb-12 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <SplitText text="Let's grow something worth talking about." as="h2" className="display-md" />
          </div>
          <Reveal delay={0.2}>
            <Link
              to="/contact"
              className="group inline-flex items-center gap-3 rounded-full bg-cream-50 px-7 py-4 text-sm font-extrabold text-pine-950 transition-colors duration-300 hover:bg-mint-300"
            >
              Book your growth call
              <span className="grid h-7 w-7 place-items-center rounded-full bg-pine-950 text-cream-50 transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
          </Reveal>
        </div>
      </div>
      <div className="container-x relative grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <Logo dark={!0} />
          <a
            href="mailto:hello@kora.agency"
            className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-mint-300 transition-colors hover:text-cream-50"
          >
            {"hello@kora.agency "}
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
        {footerColumns.map((s) => (
          <div key={s.title}>
            <h4 className="text-xs font-extrabold text-cream-50/40">
              {s.title}
            </h4>
            <ul className="mt-5 space-y-3">
              {s.links.map((n) => (
                <li key={n.label}>
                  <Link
                    to={n.to}
                    className="nav-link text-[15px] font-semibold text-cream-50/75 transition-colors hover:text-cream-50"
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="container-x relative flex flex-col items-start justify-between gap-4 border-t border-cream-50/10 py-7 text-xs font-semibold text-cream-50/45 sm:flex-row sm:items-center">
        <span>© 2026 Kora Growth Consultancy. All rights reserved.</span>
        <div className="flex items-center gap-6">
          <span>Privacy</span>
          <span>Terms</span>
          <button
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
            className="group inline-flex items-center gap-2 rounded-full border border-cream-50/15 px-4 py-2 transition-colors hover:border-mint-300 hover:text-mint-300"
          >
            Back to top
            <ArrowUp className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>
      <div className="pointer-events-none relative select-none overflow-hidden" aria-hidden={!0}>
        <div className="container-x">
          <div className="text-outline-cream -mb-[0.23em] text-center text-[24vw] leading-none font-extrabold tracking-tight lg:text-[19rem]">
            kora
          </div>
        </div>
      </div>
    </footer>
  );
}
