import { useState } from "react";
import { ArrowRight, MessageCircle } from "lucide-react";
import { SERVICES, whatsappLink, type Service } from "../content";
import { Modal } from "./Modal";
import { Reveal } from "./Reveal";

export function Services({ onBook }: { onBook: (service: string) => void }) {
  const [detail, setDetail] = useState<Service | null>(null);

  return (
    <section id="services" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-6">
            <h2 className="section-title">Our services</h2>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-5 lg:col-start-8">
            <p className="text-charcoal/75">
              From a quick threading appointment to your wedding day. Service details and prices are being finalised with the salon, so ask us on WhatsApp for
              what is available now.
            </p>
          </Reveal>
        </div>

        <ul className="mt-16 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service, i) => {
            const featured = i < 2;
            return (
              <li key={service.name} className={featured ? "sm:col-span-2" : ""}>
                <Reveal delay={(i % 4) * 0.06} className="group flex h-full flex-col">
                  <div className="overflow-hidden rounded-lg">
                    <img
                      src={service.image}
                      alt=""
                      loading="lazy"
                      className={`w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04] ${featured ? "aspect-[16/10]" : "aspect-[4/5]"}`}
                    />
                  </div>
                  <h3 className={`mt-5 ${featured ? "text-[2.1rem]" : "text-[1.7rem]"}`}>{service.name}</h3>
                  <p className="mt-2 flex-1 text-charcoal/75">{service.short}</p>
                  <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
                    <button type="button" onClick={() => onBook(service.name)} className="btn btn-outline px-4 py-2.5">
                      Book Appointment
                    </button>
                    <button
                      type="button"
                      onClick={() => setDetail(service)}
                      aria-label={`Learn more about ${service.name}`}
                      className="inline-flex items-center gap-1.5 font-medium text-rose-deep"
                    >
                      Learn More
                      <ArrowRight size={17} className="transition group-hover:translate-x-1" aria-hidden="true" />
                    </button>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>

      <Modal open={detail !== null} onClose={() => setDetail(null)} label={detail?.name ?? "Service"}>
        {detail && (
          <div className="grid overflow-hidden rounded-lg bg-ivory md:grid-cols-2">
            <img src={detail.image} alt="" className="h-64 w-full object-cover md:h-full" />
            <div className="p-8 sm:p-10">
              <h3 className="text-4xl">{detail.name}</h3>
              <p className="mt-5 text-lg text-charcoal/85">{detail.short}</p>
              <p className="mt-4 text-charcoal/75">{detail.more}</p>
              <p className="mt-4 text-charcoal/75">Prices and timings are confirmed by the salon when you book.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  className="btn btn-dark"
                  onClick={() => {
                    setDetail(null);
                    onBook(detail.name);
                  }}
                >
                  Book Appointment
                </button>
                <a
                  className="btn btn-outline"
                  href={whatsappLink(`Hello ZEE Beauty Saloon, I would like to ask about ${detail.name}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle size={18} aria-hidden="true" />
                  Ask on WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
