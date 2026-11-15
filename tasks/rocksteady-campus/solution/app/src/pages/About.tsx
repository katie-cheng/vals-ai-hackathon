import { Link } from "react-router-dom";
import { PageHero, Reveal, SectionHeading } from "../components/UI";
import { useStore } from "../lib/store";

export default function AboutPage() {
  const { data } = useStore();
  const e = data.content;
  const quality = [
    { title: e.qualityCardOneTitle, text: e.qualityCardOneText },
    { title: e.qualityCardTwoTitle, text: e.qualityCardTwoText },
    { title: e.qualityCardThreeTitle, text: e.qualityCardThreeText },
  ];
  return (
    <>
      <PageHero title={e.aboutHeroTitle} text={e.aboutHeroText} image={data.images.aboutCommunity} />
      <section className="section bg-cream">
        <div className="container-site">
          <Reveal className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="skeleton overflow-hidden rounded-lg lg:col-span-5">
              <img
                src={data.images.aboutStory}
                alt="Friends enjoying a Rocksteady meal together"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <div className="lg:col-span-7">
              <SectionHeading title={e.storyTitle} />
              <div className="mt-4 space-y-4 text-[15px] leading-7 text-neutral-600">
                <p>{e.storyTextOne}</p>
                <p>{e.storyTextTwo}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
      <section className="section bg-black text-white">
        <div className="container-site">
          <Reveal className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              <SectionHeading light title={e.passionTitle} text={e.passionText} />
              <Link to="/menu" className="btn-white mt-6">
                See the menu
              </Link>
            </div>
            <div className="skeleton relative overflow-hidden rounded-lg lg:col-span-5">
              <img
                src={data.images.aboutKitchen}
                alt="Fresh food being prepared on the grill"
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          </Reveal>
        </div>
      </section>
      <section className="section bg-white">
        <div className="container-site">
          <Reveal>
            <SectionHeading title={e.qualityTitle} text={e.qualityText} />
            <div className="mt-8 grid gap-x-8 md:grid-cols-3">
              {quality.map((point) => (
                <div key={point.title} className="border-t border-black/15 py-5">
                  <h3 className="card-title">{point.title}</h3>
                  <p className="mt-2 text-[15px] leading-7 text-neutral-600">{point.text}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
      <section className="bg-brand py-14 text-white">
        <div className="container-site">
          <Reveal className="max-w-2xl">
            <h2 className="display-title">{e.portionsTitle}</h2>
            <p className="mt-3 text-[15px] leading-7 text-white/90">{e.portionsText}</p>
          </Reveal>
        </div>
      </section>
      <section className="section bg-cream">
        <div className="container-site">
          <Reveal className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              <SectionHeading title={e.communityTitle} text={e.communityText} />
            </div>
            <div className="skeleton overflow-hidden rounded-lg lg:col-span-5">
              <img
                src={data.images.aboutCommunity}
                alt="The Rocksteady Campus community sharing food"
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
