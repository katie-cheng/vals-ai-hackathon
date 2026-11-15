import { site } from "../config/site";
import { useLang } from "../i18n/LanguageContext";
import PageIntro from "../components/PageIntro";
import PageMeta from "../components/PageMeta";
import Photo from "../components/Photo";
import Reveal from "../components/Reveal";

export default function Story() {
  const { t } = useLang();
  const s = t.story;
  return (
    <>
      <PageMeta page="story" />
      <PageIntro title={s.title} lead={s.lead} photo="houseGarden" />
      <section className="section split">
        <Reveal className="split-text">
          <h2>{s.familyTitle}</h2>
          {s.familyBody.map((p) => <p key={p}>{p}</p>)}
        </Reveal>
        <Reveal className="split-photo">
          <Photo name="breakfast" />
        </Reveal>
      </section>
      <div className="band band-sand">
        <section className="section split reverse">
          <Reveal className="split-text">
            <h2>{s.traditionsTitle}</h2>
            {s.traditionsBody.map((p) => <p key={p}>{p}</p>)}
          </Reveal>
          <Reveal className="split-photo">
            <Photo name="salonYellow" />
          </Reveal>
        </section>
      </div>
      <section className="section languages" aria-labelledby="languages-title">
        <h2 id="languages-title">{s.languagesTitle}</h2>
        <ul className="language-list">
          {site.spokenLanguages.map((l) => <li key={l}>{t.spokenNames[l]}</li>)}
        </ul>
      </section>
    </>
  );
}
