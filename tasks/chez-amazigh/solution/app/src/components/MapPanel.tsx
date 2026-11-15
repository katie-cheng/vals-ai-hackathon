import { site } from "../config/site";
import { useLang } from "../i18n/LanguageContext";

const { lat, lng } = site.geo;
const BBOX = [lng - 0.03, lat - 0.02, lng + 0.03, lat + 0.02].map((n) => n.toFixed(5)).join(",");

/** OpenStreetMap embed: interactive, free and keyless, centred on the house. */
export default function MapPanel() {
  const { t } = useLang();
  return (
    <div className="map-frame">
      <iframe
        title={t.location.mapTitle}
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${BBOX}&layer=mapnik&marker=${lat},${lng}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
