import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { site } from "../config/site";
import { useLang } from "../i18n/LanguageContext";
import Photo from "../components/Photo";
import Reveal from "../components/Reveal";
import RatingPanel from "../components/RatingPanel";
import BookingLinks from "../components/BookingLinks";
import PageMeta from "../components/PageMeta";
import type { PhotoKey } from "../config/gallery";

const THEMES: { key: "stay" | "table" | "village"; to: string; photo: PhotoKey }[] = [
  { key: "stay", to: "/accommodation", photo: "salonFireplace" },
  { key: "table", to: "/gastronomy", photo: "tagine" },
  { key: "village", to: "/experiences", photo: "gardenPath" },
];

export default function Home() {
  const { t } = useLang();
  const h = t.home;
  const a = site.address;
  return (
    <>
      <PageMeta page="home" />
      <section className="hero">
        <Photo name="exteriorGarden" className="hero-photo" eager sizes="100vw" />
        <div className="hero-text">
          <h1>{h.heroTitle}</h1>
          <p>{h.heroLead}</p>
          <div className="hero-actions">
            <Link className="button button-light" to="/contact">{h.heroPrimary}</Link>
            <Link className="text-link text-link-light" to="/accommodation">{h.heroSecondary} <ArrowRight size={16} aria-hidden="true" className="flip" /></Link>
          </div>
        </div>
      </section>

      <section className="section intro">
        <Reveal className="intro-text">
          <h2>{h.introTitle}</h2>
          {h.introBody.map((p) => <p key={p}>{p}</p>)}
          <p className="note">{h.introAside}</p>
        </Reveal>
        <Reveal className="intro-photo">
          <Photo name="facade" />
        </Reveal>
      </section>

      <section className="section themes" aria-labelledby="themes-title">
        <h2 id="themes-title" className="section-title">{h.themesTitle}</h2>
        <div className="themes-grid">
          {THEMES.map((th) => (
            <Reveal as="article" key={th.key} className="theme">
              <Photo name={th.photo} />
              <h3>{h.themes[th.key].title}</h3>
              <p>{h.themes[th.key].body}</p>
              <Link className="text-link" to={th.to}>{h.themes[th.key].link} <ArrowRight size={16} aria-hidden="true" className="flip" /></Link>
            </Reveal>
          ))}
        </div>
      </section>

      <div className="band band-olive">
        <div className="section">
          <RatingPanel />
        </div>
      </div>

      <section className="section split">
        <Reveal className="split-photo">
          <Photo name="terrace" />
        </Reveal>
        <Reveal className="split-text">
          <h2>{h.locationTitle}</h2>
          <p>{h.locationBody}</p>
          <address>{a.locality}, {a.city}, {a.postalCode}, {a.country}</address>
          <div className="link-row">
            <Link className="text-link" to="/location">{h.locationLink} <ArrowRight size={16} aria-hidden="true" className="flip" /></Link>
            <a className="text-link" href={site.links.maps} target="_blank" rel="noopener noreferrer">{t.common.openMaps}</a>
          </div>
        </Reveal>
      </section>

      <section className="band band-terracotta">
        <div className="section cta">
          <h2>{h.ctaTitle}</h2>
          <p>{h.ctaBody}</p>
          <div className="cta-actions">
            <Link className="button button-light" to="/contact">{t.common.inquire}</Link>
            <BookingLinks className="on-dark" />
          </div>
        </div>
      </section>
    </>
  );
}
