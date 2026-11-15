import { CountUp, Heading, Reveal, RevealImage, Stagger, StaggerItem } from "../components/motion";
import { CtaBanner, PageHero } from "../components/shared";
import { stats, team, timeline, values } from "../data/content";

export function About() {
  return (
    <>
      <PageHero
        title="A consultancy built for the revenue-obsessed."
        copy="We started Kora because growth advice was broken: agencies sold hours, consultants sold decks, and nobody owned the number. So we built the firm we always wanted to hire."
      />
      <section className="container-x pb-[clamp(4rem,7vw,6.5rem)]">
        <div className="grid gap-x-8 gap-y-10 lg:grid-cols-12">
          <RevealImage src="/images/about-office.jpg" alt="Inside the Kora studio" className="aspect-[4/5] lg:col-span-5" eager={true} />
          <div className="lg:col-span-6 lg:col-start-7">
            <Heading text="Founded on a frustration." className="display-md" />
            <Reveal>
              <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-ink-700">
                <p>
                  In 2019, our founders sat on opposite sides of the same broken table, one in strategy consulting, one in performance agencies. Both watched great advice die in
                  handoffs: the strategists never shipped, the agencies never thought.
                </p>
                <p>
                  Kora fuses the two. Senior strategists who also run the sprints. Creative directors who read P&Ls. RevOps architects who sit in on positioning workshops. One team,
                  one number: your revenue.
                </p>
                <p>Six years and 120+ engagements later, the model hasn't changed. It's just gotten sharper. And our clients' boards have noticed.</p>
              </div>
            </Reveal>
            <dl className="mt-8 grid grid-cols-3 gap-x-8 border-t border-ink-900/15 pt-5">
              {stats.slice(0, 3).map((s) => (
                <div key={s.label} className="flex flex-col-reverse justify-end">
                  <dt className="mt-1 text-sm leading-snug text-ink-500">{s.label}</dt>
                  <dd className="figure text-3xl leading-none">
                    <CountUp value={s.value} decimals={s.decimals ?? 0} prefix={s.prefix ?? ""} suffix={s.suffix ?? ""} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
      <section className="grain-surface bg-pine-950 text-cream-50">
        <div className="container-x section-pad">
          <Heading text="Values that survive contact with revenue." className="display-md max-w-2xl" />
          <Stagger className="mt-10 grid gap-x-8 sm:grid-cols-2">
            {values.map((v) => (
              <StaggerItem key={v.title} className="border-t border-cream-50/15 py-6">
                <h3 className="display-sm">{v.title}</h3>
                <p className="mt-2 max-w-md text-[15px] leading-relaxed text-cream-50/70">{v.desc}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
      <section className="container-x section-pad">
        <div className="grid gap-x-8 gap-y-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Heading text="Six years of compounding." className="display-md" />
            <Reveal>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-500">From two laptops to a 24-person senior team, every chapter taught us something we now install in our clients.</p>
            </Reveal>
          </div>
          <ol className="border-t border-ink-900/15 lg:col-span-7">
            {timeline.map((t) => (
              <li key={t.year} className="border-b border-ink-900/15">
                <Reveal className="grid grid-cols-[4.5rem_1fr] gap-x-8 py-5">
                  <span className="figure text-xl text-pine-700">{t.year}</span>
                  <div>
                    <h3 className="text-[17px]">{t.title}</h3>
                    <p className="mt-1 max-w-md text-[15px] leading-relaxed text-ink-500">{t.desc}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="container-x pb-[clamp(4rem,7vw,6.5rem)]">
        <div className="grid gap-x-8 gap-y-4 lg:grid-cols-12 lg:items-end">
          <Heading text="Senior only. No exceptions." className="display-md lg:col-span-7" />
          <Reveal className="lg:col-span-5">
            <p className="text-[15px] leading-relaxed text-ink-500">The people who'll actually be in your Slack, on your calls, and in your board deck.</p>
          </Reveal>
        </div>
        <Stagger className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((m) => (
            <StaggerItem key={m.name}>
              <div className="aspect-[4/5] overflow-hidden rounded-lg bg-cream-200">
                <img src={m.image} alt={m.name} className="h-full w-full object-cover object-top" loading="lazy" decoding="async" />
              </div>
              <h3 className="display-sm mt-4">{m.name}</h3>
              <p className="text-[15px] text-ink-500">{m.role}</p>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-700">{m.bio}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
      <CtaBanner />
    </>
  );
}
