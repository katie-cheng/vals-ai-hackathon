import { useLang } from "../i18n/LanguageContext";
import PageIntro from "../components/PageIntro";
import PageMeta from "../components/PageMeta";
import Photo from "../components/Photo";
import Reveal from "../components/Reveal";

export default function Table() {
  const { t } = useLang();
  const s = t.table;
  return (
    <>
      <PageMeta page="table" />
      <PageIntro title={s.title} lead={s.lead} photo="breakfast" />
      <section className="section split">
        <Reveal className="split-text">
          <h2>{s.breakfastTitle}</h2>
          {s.breakfastBody.map((p) => <p key={p}>{p}</p>)}
        </Reveal>
        <Reveal className="split-photo">
          <Photo name="terrace" />
        </Reveal>
      </section>
      <div className="band band-sand">
        <section className="section split reverse">
          <Reveal className="split-text">
            <h2>{s.cuisineTitle}</h2>
            {s.cuisineBody.map((p) => <p key={p}>{p}</p>)}
          </Reveal>
          <Reveal className="split-photo">
            <Photo name="tagine" />
          </Reveal>
        </section>
      </div>
      <section className="section two-notes">
        <Reveal>
          <h2>{s.gardenTitle}</h2>
          <p>{s.gardenBody}</p>
        </Reveal>
        <Reveal>
          <h2>{s.noteTitle}</h2>
          <p>{s.noteBody}</p>
        </Reveal>
      </section>
    </>
  );
}
