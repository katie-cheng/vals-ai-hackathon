import { LANGS, useLang, type Lang } from "../i18n/LanguageContext";

const SHORT: Record<Lang, string> = { en: "En", fr: "Fr", ar: "عربي" };

/** The three site languages as a button group; each button is named in its own language. */
export default function LanguageSwitch({ className = "", long = false }: { className?: string; long?: boolean }) {
  const { lang, setLang, t } = useLang();
  return (
    <div className={`lang-switch ${className}`} role="group" aria-label={t.nav.language}>
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-label={t.languages[l]}
          aria-pressed={lang === l}
          className={lang === l ? "is-current" : ""}
          onClick={() => setLang(l)}
        >
          {long ? t.languages[l] : SHORT[l]}
        </button>
      ))}
    </div>
  );
}
