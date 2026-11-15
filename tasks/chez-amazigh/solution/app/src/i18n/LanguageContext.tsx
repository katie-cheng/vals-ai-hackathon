import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import en, { type Dict } from "./en";
import fr from "./fr";
import ar from "./ar";
import { site } from "../config/site";

export type Lang = "en" | "fr" | "ar";
export const LANGS: Lang[] = ["en", "fr", "ar"];
const KEY = "lang";

const FACTS: Record<string, string> = {
  reviews: String(site.ratings.reviews),
  checkIn: site.policies.checkIn,
  checkOut: site.policies.checkOut,
};

/** Fills {reviews}, {checkIn} and {checkOut} in the dictionaries from config/site.ts. */
function fillFacts<T>(v: T): T {
  if (typeof v === "string") return v.replace(/\{(\w+)\}/g, (m, k: string) => FACTS[k] ?? m) as T;
  if (Array.isArray(v)) return v.map(fillFacts) as T;
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, fillFacts(x)])) as T;
  return v;
}
const FILLED: Record<Lang, Dict> = { en: fillFacts(en), fr: fillFacts(fr), ar: fillFacts(ar) };

function initialLang(): Lang {
  const fromUrl = new URLSearchParams(location.search).get("lang");
  if (fromUrl && LANGS.includes(fromUrl as Lang)) return fromUrl as Lang;
  try {
    const stored = localStorage.getItem(KEY);
    if (stored && LANGS.includes(stored as Lang)) return stored as Lang;
  } catch {
    // Storage can be unavailable (private mode); fall back to the browser language.
  }
  const nav = (navigator.language || "en").slice(0, 2);
  return LANGS.includes(nav as Lang) ? (nav as Lang) : "en";
}

type Ctx = { lang: Lang; t: Dict; dir: "ltr" | "rtl"; setLang: (l: Lang) => void };
const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const value = useMemo<Ctx>(
    () => ({
      lang,
      dir,
      t: FILLED[lang],
      setLang: (l) => {
        setLangState(l);
        try {
          localStorage.setItem(KEY, l);
        } catch {
          // Not persisted; the choice still applies to this visit.
        }
      },
    }),
    [lang, dir],
  );
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
}

/** Formats a score with the decimal separator of the current language (9,4 in French). */
export function formatScore(n: number, lang: Lang) {
  return lang === "fr" ? n.toFixed(1).replace(".", ",") : n.toFixed(1);
}
