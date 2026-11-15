import { GALLERY } from "../content";
import { Reveal } from "./Reveal";

export function Gallery() {
  return (
    <section id="gallery" className="section bg-ink text-ivory">
      <div className="wrap">
        <Reveal className="max-w-2xl">
          <span className="rule" aria-hidden="true" />
          <h2 className="section-title mt-6">Gallery</h2>
          <p className="mt-6 text-ivory/80">Bridal makeup, party looks, hairstyles, transformations and the calm spaces where they happen.</p>
        </Reveal>
        <div className="mt-14 columns-1 gap-6 sm:columns-2 lg:columns-3">
          {GALLERY.map((g) => (
            <Reveal key={g.image} className="mb-6 break-inside-avoid">
              <figure className="group">
                <div className={`overflow-hidden ${g.tall ? "aspect-[4/5]" : "aspect-[4/3]"}`}>
                  <img
                    src={`/images/${g.image}`}
                    alt={g.alt}
                    width={800}
                    height={g.tall ? 1000 : 600}
                    loading="lazy"
                    className="size-full object-cover transition duration-700 ease-soft group-hover:scale-[1.04] group-hover:brightness-105"
                  />
                </div>
                <figcaption className="mt-3 text-[0.95rem] text-ivory/80">{g.caption}</figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
        <p className="mt-8 max-w-2xl text-[0.95rem] text-ivory/70">These are illustrative photographs; studio and client photos will be added as they are taken.</p>
      </div>
    </section>
  );
}
