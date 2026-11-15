import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, Flame, HeartHandshake, Scale, Sparkles, UsersRound } from "lucide-react";
import { PageHero, Reveal, SectionHeading } from "../components/UI";
import { useStore } from "../lib/store";

export default function AboutPage() {
  const { data } = useStore();
  const e = data.content;
  return (
    <>
      <PageHero
        eyebrow={e.aboutHeroEyebrow}
        title={e.aboutHeroTitle}
        text={e.aboutHeroText}
        image={data.images.aboutCommunity}
      />
      <section className="overflow-hidden bg-cream py-20 sm:py-28">
        <div className="container-site grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div className="relative pb-10 pl-5 sm:pl-10">
              <div className="overflow-hidden rounded-[2rem]">
                <img
                  src={data.images.aboutStory}
                  alt="Friends enjoying a Rocksteady meal together"
                  className="aspect-[4/4.3] w-full object-cover"
                />
              </div>
              <div className="absolute bottom-0 left-0 rounded-2xl bg-brand p-6 text-white shadow-xl sm:p-8">
                <p className="font-display text-5xl font-black">100%</p>
                <p className="mt-1 text-[10px] font-bold tracking-[.18em] uppercase">Rockville heart</p>
              </div>
              <div className="absolute top-8 -right-4 hidden h-24 w-24 items-center justify-center rounded-full border-8 border-cream bg-black text-center font-display text-sm leading-4 font-bold text-white uppercase sm:flex">
                Proudly
                <br />
                <span className="text-brand">Soweto</span>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <SectionHeading eyebrow={e.storyEyebrow} title={e.storyTitle} />
            <div className="mt-6 space-y-5 text-[15px] leading-8 text-neutral-600">
              <p>{e.storyTextOne}</p>
              <p>{e.storyTextTwo}</p>
            </div>
            <div className="mt-8 flex items-center gap-4 border-t border-black/10 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
                <HeartHandshake size={22} />
              </div>
              <p className="font-display text-2xl font-bold uppercase">
                Local food. Local people.
                <br />
                <span className="text-brand">Real connection.</span>
              </p>
            </div>
          </Reveal>
        </div>
      </section>
      <section className="bg-black py-20 text-white sm:py-28">
        <div className="container-site grid items-center gap-12 lg:grid-cols-2">
          <Reveal className="lg:order-2">
            <div className="relative overflow-hidden rounded-[2rem]">
              <img
                src={data.images.aboutKitchen}
                alt="Fresh food being prepared on the grill"
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 flex items-center gap-3 rounded-full bg-black/70 px-5 py-3 backdrop-blur-md">
                <Flame size={18} className="text-brand" />
                <span className="text-xs font-bold uppercase tracking-wider">Fresh off the flames</span>
              </div>
            </div>
          </Reveal>
          <Reveal className="lg:order-1" delay={0.1}>
            <SectionHeading light eyebrow={e.passionEyebrow} title={e.passionTitle} text={e.passionText} />
            <Link to="/menu" className="btn-primary mt-8">
              Taste the passion
              <ArrowRight size={15} />
            </Link>
          </Reveal>
        </div>
      </section>
      <section className="bg-white py-20 sm:py-28">
        <div className="container-site">
          <Reveal>
            <SectionHeading eyebrow={e.qualityEyebrow} title={e.qualityTitle} text={e.qualityText} align="center" />
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              { icon: BadgeCheck, title: e.qualityCardOneTitle, text: e.qualityCardOneText },
              { icon: Flame, title: e.qualityCardTwoTitle, text: e.qualityCardTwoText },
              { icon: Sparkles, title: e.qualityCardThreeTitle, text: e.qualityCardThreeText },
            ].map((c, x) => (
              <Reveal key={c.title} delay={x * 0.09}>
                <div className="h-full rounded-3xl border border-black/10 bg-cream p-8">
                  <c.icon size={27} className="text-brand" />
                  <h3 className="mt-6 font-display text-2xl font-bold uppercase">{c.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-neutral-500">{c.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-brand py-16 text-white">
        <div className="container-site grid items-center gap-8 lg:grid-cols-[1fr_auto]">
          <Reveal>
            <div className="flex items-start gap-5">
              <Scale size={40} className="hidden shrink-0 sm:block" />
              <div>
                <h2 className="max-w-4xl font-display text-4xl leading-none font-black uppercase sm:text-6xl">
                  {e.portionsTitle}
                </h2>
                <p className="mt-5 max-w-3xl text-sm leading-7 text-white/75">{e.portionsText}</p>
              </div>
            </div>
          </Reveal>
          <Link
            to="/order"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-black px-7 text-xs font-extrabold tracking-wider uppercase"
          >
            Order your favourite
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>
      <section className="bg-cream py-20 sm:py-28">
        <div className="container-site grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <SectionHeading eyebrow={e.communityEyebrow} title={e.communityTitle} text={e.communityText} />
            <div className="mt-8 flex items-center gap-4">
              <UsersRound size={28} className="text-brand" />
              <p className="text-xs font-extrabold tracking-[.15em] uppercase">1563 Makapane Street · Our home</p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="overflow-hidden rounded-[2rem] shadow-xl">
              <img
                src={data.images.aboutCommunity}
                alt="The Rocksteady Campus community sharing food"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
