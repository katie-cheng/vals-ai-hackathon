import { useLang } from "../i18n/LanguageContext";

export default function PolicyList() {
  const { t } = useLang();
  const p = t.stay.policies;
  return (
    <section className="policies" aria-labelledby="policies-title">
      <h2 id="policies-title">{t.stay.policiesTitle}</h2>
      <ul>
        {[p.checkIn, p.checkOut, p.children, p.pets, p.parties, p.cancellation].map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <p className="note">{t.stay.policiesNote}</p>
    </section>
  );
}
