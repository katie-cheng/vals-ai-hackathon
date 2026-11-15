import { useLang } from "../i18n/LanguageContext";
import PageIntro from "../components/PageIntro";
import PageMeta from "../components/PageMeta";
import Photo from "../components/Photo";
import Reveal from "../components/Reveal";
import type { PhotoKey } from "../config/gallery";

const PHOTOS: PhotoKey[] = ["hammam", "houseGarden", "gardenPath", "facade", "salonSeating"];

export default function Experiences() {
  const { t } = useLang();
  const s = t.experiences;
  return (
    <>
      <PageMeta page="experiences" />
      <PageIntro title={s.title} lead={s.lead} photo="gardenView" />
      <section className="section experiences">
        {s.items.map((x, i) => (
          <Reveal as="article" key={x.title} className={`experience ${i % 2 ? "reverse" : ""}`}>
            <div className="experience-photo">
              <Photo name={PHOTOS[i]} />
            </div>
            <div className="experience-text">
              <h2>{x.title}</h2>
              <p>{x.body}</p>
            </div>
          </Reveal>
        ))}
      </section>
      <div className="band band-olive">
        <section className="section plan">
          <h2>{s.planTitle}</h2>
          <p className="lead">{s.planBody}</p>
        </section>
      </div>
    </>
  );
}
