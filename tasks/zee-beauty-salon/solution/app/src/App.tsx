import { useCallback, useState } from "react";
import { MotionConfig } from "motion/react";
import { About } from "./components/About";
import { Booking } from "./components/Booking";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import { Gallery } from "./components/Gallery";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Highlights } from "./components/Highlights";
import { Services } from "./components/Services";

export default function App() {
  // The nonce lets the same service be picked twice in a row and still re-fill the form.
  const [selected, setSelected] = useState<{ name: string; nonce: number } | null>(null);
  const book = useCallback((name: string) => {
    setSelected({ name, nonce: Date.now() });
    document.getElementById("booking")?.scrollIntoView();
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-charcoal focus:px-4 focus:py-2 focus:text-ivory">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Hero />
        <About />
        <Services onBook={book} />
        <Gallery />
        <Highlights />
        <Booking selectedService={selected} />
        <Contact />
      </main>
      <Footer />
    </MotionConfig>
  );
}
