import { useState } from "react";
import { site } from "../config/site";
import { useLang } from "../i18n/LanguageContext";
import PageIntro from "../components/PageIntro";
import PageMeta from "../components/PageMeta";
import MapPanel from "../components/MapPanel";

export default function Location() {
  const { t } = useLang();
  const l = t.location;
  const a = site.address;
  const [copied, setCopied] = useState(false);
  const coords = `${site.geo.lat}, ${site.geo.lng}`;
  return (
    <>
      <PageMeta page="location" />
      <PageIntro title={l.title} lead={l.lead} />
      <section className="section location">
        <MapPanel />
        <div className="location-details">
          <div>
            <h2>{l.addressTitle}</h2>
            <address>
              {a.locality}
              <br />
              {a.city}, {a.postalCode}
              <br />
              {a.country}
            </address>
          </div>
          <div>
            <h2>{l.gpsTitle}</h2>
            <p dir="ltr" className="coords">
              {l.latitude} {site.geo.lat}
              <br />
              {l.longitude} {site.geo.lng}
            </p>
            <button type="button" className="text-button" onClick={() => navigator.clipboard?.writeText(coords).then(() => setCopied(true), () => setCopied(false))}>
              {copied ? l.copied : l.copy}
            </button>
          </div>
          <div className="location-actions">
            <a className="button" href={site.links.directions} target="_blank" rel="noopener noreferrer">{t.common.directions}</a>
            <a className="text-link" href={site.links.maps} target="_blank" rel="noopener noreferrer">{t.common.openMaps}</a>
          </div>
        </div>
      </section>
      <div className="band band-sand">
        <section className="section" aria-labelledby="getting-title">
          <h2 id="getting-title" className="section-title">{l.gettingTitle}</h2>
          <div className="getting">
            {l.getting.map((g) => (
              <div key={g.title}>
                <h3>{g.title}</h3>
                <p>{g.body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
