import { Reveal } from "./Reveal";

export function About() {
  return (
    <section id="about" className="section bg-beige">
      <div className="wrap grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <Reveal className="relative aspect-[4/5] overflow-hidden">
          <img src="/images/about.jpg" alt="Stylist pinning a bridal updo with a crystal hair accessory in a warm, softly lit salon" width={939} height={1600} loading="lazy" className="size-full object-cover" />
        </Reveal>
        <Reveal delay={0.1}>
          <span className="rule" aria-hidden="true" />
          <h2 className="section-title mt-6">Your beauty, our passion.</h2>
          <div className="mt-8 space-y-5 text-muted">
            <p>
              SHE Salon &amp; Make-up Studio is a women-only beauty destination in Jhusi, Prayagraj, offering professional beauty, makeup and hairstyling services under one
              roof.
            </p>
            <p>
              Every appointment begins with a conversation. We take time to understand your features, your style and the occasion, so the result feels like you, only more
              radiant.
            </p>
            <p>Unhurried appointments, attentive care and a calm, comfortable studio: we want you to leave happy with how you look and how you were looked after.</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
