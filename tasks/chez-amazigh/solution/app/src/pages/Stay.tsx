import { useLang } from "../i18n/LanguageContext";
import PageIntro from "../components/PageIntro";
import PageMeta from "../components/PageMeta";
import Photo from "../components/Photo";
import Reveal from "../components/Reveal";
import PolicyList from "../components/PolicyList";
import BookingLinks from "../components/BookingLinks";
import type { PhotoKey } from "../config/gallery";

const ROOM_PHOTOS: PhotoKey[] = ["bedroom2", "salonFireplace", "bathroom", "kitchen", "hammam"];

export default function Stay() {
  const { t } = useLang();
  const s = t.stay;
  return (
    <>
      <PageMeta page="stay" />
      <PageIntro title={s.title} lead={s.lead} photo="salonRed" />
      <section className="section" aria-labelledby="rooms-title">
        <h2 id="rooms-title" className="section-title">{s.roomsTitle}</h2>
        <div className="rooms">
          {s.rooms.map((r, i) => (
            <Reveal as="article" key={r.title} className="room">
              <Photo name={ROOM_PHOTOS[i]} />
              <div>
                <h3>{r.title}</h3>
                <p>{r.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      <div className="band band-sand">
        <section className="section sleeping">
          <h2>{s.sleepingTitle}</h2>
          <p className="lead">{s.sleepingBody}</p>
        </section>
      </div>
      <section className="section" aria-labelledby="facilities-title">
        <h2 id="facilities-title" className="section-title">{s.facilitiesTitle}</h2>
        <dl className="facilities">
          {s.facilities.map((f) => (
            <div key={f.title}>
              <dt>{f.title}</dt>
              <dd>{f.body}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="section split">
        <PolicyList />
        <Reveal className="split-photo">
          <Photo name="billiards" />
        </Reveal>
      </section>
      <section className="section platform-row">
        <BookingLinks />
      </section>
    </>
  );
}
