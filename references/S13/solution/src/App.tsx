import { MotionConfig } from "framer-motion";
import { BeforeAfter } from "./components/BeforeAfter";
import { Faq } from "./components/Faq";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { PricingAreas } from "./components/PricingAreas";
import { Process } from "./components/Process";
import { Quote } from "./components/Quote";
import { Services } from "./components/Services";
import { Trust } from "./components/Trust";
import { SITE } from "./data/content";

function App() {
  return (
    <MotionConfig reducedMotion="user">
    <div className="min-h-screen bg-[#04141f] text-white">
      <a
        href="#services"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[110] focus:rounded-md focus:bg-cyan-300 focus:px-5 focus:py-2.5 focus:font-medium focus:text-[#04141f]"
      >
        Skip to main content
      </a>
      <Header />
      <main>
        <Hero />
        <Services />
        <BeforeAfter />
        <Process />
        <Trust />
        <PricingAreas />
        <Faq />
        <Quote />
      </main>
      <Footer />
      <span className="sr-only">{SITE.tagline}</span>
    </div>
    </MotionConfig>
  );
}

export { App };
