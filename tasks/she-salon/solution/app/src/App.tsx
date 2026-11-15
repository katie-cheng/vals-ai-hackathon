import { MotionConfig } from "motion/react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { About } from "./components/About";
import { Services } from "./components/Services";
import { Gallery } from "./components/Gallery";
import { WhyUs } from "./components/WhyUs";
import { Reviews } from "./components/Reviews";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import { WhatsAppButton } from "./components/WhatsAppButton";

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:text-ivory">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Hero />
        <About />
        <Services />
        <Gallery />
        <WhyUs />
        <Reviews />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
    </MotionConfig>
  );
}
