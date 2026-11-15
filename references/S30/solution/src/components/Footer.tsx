import { Link } from "react-router-dom";
import { ArrowUp } from "lucide-react";
import { Logo } from "./Nav";

const FOOTER_COLUMNS = [
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
];

export function Footer() {
  return (
    <footer className="grain-surface bg-pine-950 text-cream-50">
      <div className="container-x grid gap-x-8 gap-y-10 py-16 sm:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <Logo dark={true} />
          <a href="mailto:hello@kora.agency" className="text-link text-link-light mt-5 block w-fit text-[15px]">
            hello@kora.agency
          </a>
        </div>
        {FOOTER_COLUMNS.map((c) => (
          <div key={c.title} className="lg:col-span-3">
            <h2 className="text-[15px] text-cream-50/55">{c.title}</h2>
            <ul className="mt-4 space-y-3">
              {c.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-[15px] text-cream-50/85 transition-colors hover:text-cream-50">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="container-x">
        <div className="flex items-center justify-between gap-4 border-t border-cream-50/10 py-5 text-sm text-cream-50/55">
          <span>© 2026 Kora Growth Consultancy</span>
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="icon-btn icon-btn-light" aria-label="Back to top">
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
