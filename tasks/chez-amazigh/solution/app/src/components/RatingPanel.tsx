import { site } from "../config/site";
import { formatScore, useLang } from "../i18n/LanguageContext";

/** Booking.com review scores from config/site.ts, always shown with their source. */
export default function RatingPanel() {
  const { t, lang } = useLang();
  const r = site.ratings;
  return (
    <section className="ratings" aria-labelledby="ratings-title">
      <div className="ratings-head">
        <h2 id="ratings-title">{t.ratings.title}</h2>
        <p className="ratings-overall">
          <span className="ratings-score">{formatScore(r.overall, lang)}</span>
          <span className="ratings-scale">
            {t.ratings.overallLabel}, {t.ratings.outOf}
            <br />
            {t.ratings.reviews}
          </span>
        </p>
      </div>
      <dl className="ratings-list">
        {r.categories.map((c) => (
          <div key={c.key} className="ratings-row">
            <dt>{t.ratings.categories[c.key]}</dt>
            <dd>
              <span className="ratings-bar" aria-hidden="true">
                <span style={{ inlineSize: `${(c.score / r.scale) * 100}%` }} />
              </span>
              <span className="ratings-value">{formatScore(c.score, lang)}</span>
            </dd>
          </div>
        ))}
      </dl>
      <p className="ratings-source">
        {t.ratings.attribution}{" "}
        <a href={r.url} target="_blank" rel="noopener noreferrer">{t.ratings.readReviews}</a>
      </p>
    </section>
  );
}
