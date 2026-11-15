import { ArrowUpRight } from "lucide-react";
import { site } from "../config/site";
import { useLang } from "../i18n/LanguageContext";

/** Links to the two platforms where the house is listed. */
export default function BookingLinks({ className = "" }: { className?: string }) {
  const { t } = useLang();
  return (
    <div className={`platform-links ${className}`}>
      <a className="text-link" href={site.links.booking} target="_blank" rel="noopener noreferrer">
        {t.common.bookingCom} <ArrowUpRight size={16} aria-hidden="true" />
      </a>
      <a className="text-link" href={site.links.airbnb} target="_blank" rel="noopener noreferrer">
        {t.common.airbnb} <ArrowUpRight size={16} aria-hidden="true" />
      </a>
    </div>
  );
}
