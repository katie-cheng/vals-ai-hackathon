import { useEffect } from "react";
import { useLang } from "../i18n/LanguageContext";
import type { PageKey } from "./routes";

/** Per-page document title and meta description, in the current language. */
export default function PageMeta({ page }: { page: PageKey }) {
  const { t } = useLang();
  useEffect(() => {
    document.title = page === "home" ? t.meta.siteTitle : `${t.meta.pages[page]} | Gîte chez l'habitant Amazigh`;
    document.querySelector('meta[name="description"]')?.setAttribute("content", t.meta.description);
  }, [page, t]);
  return null;
}
