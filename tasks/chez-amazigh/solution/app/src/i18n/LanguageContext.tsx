import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import en, { type Dict } from "./en";
import fr from "./fr";
import ar from "./ar";

export type Lang = "en" | "fr" | "ar";
export const LANGS: Lang[] = ["en", "fr", "ar"];
const DICTS: Record<Lang, Dict> = { en, fr, ar };
const KEY = "lang";

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
      t: DICTS[lang],
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
