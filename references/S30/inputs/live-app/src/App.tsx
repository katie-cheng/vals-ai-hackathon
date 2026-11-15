import { useCallback, useEffect, useState } from "react";
import Lenis from "lenis";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { Preloader } from "./components/Preloader";
import { Cursor } from "./components/Cursor";
import { BackToTop, ScrollProgress } from "./components/shared";
import { Nav } from "./components/Nav";
import { PageTransition } from "./components/PageTransition";
import { HomeC1 } from "./pages/Home";
import { About } from "./pages/About";
import { ServiceDetail, Services } from "./pages/Services";
import { CaseStudy, Work } from "./pages/Work";
import { Pricing } from "./pages/Pricing";
import { InsightPost, Insights } from "./pages/Insights";
import { Contact } from "./pages/Contact";
import { Footer } from "./components/Footer";

export function App() {
  const [s, n] = useState(!0),
    l = useCallback(() => n(!1), []);
  return (
    useEffect(() => {
      const r = new Lenis({
        duration: 1.15,
        smoothWheel: !0,
      });
      let d = 0;
      const f = (h) => {
        (r.raf(h), (d = requestAnimationFrame(f)));
      };
      return (
        (d = requestAnimationFrame(f)),
        () => {
          (cancelAnimationFrame(d), r.destroy());
        }
      );
    }, []),
    useEffect(
      () => (
        (document.body.style.overflow = s ? "hidden" : ""),
        () => {
          document.body.style.overflow = "";
        }
      ),
      [s],
    ),
    (
      <BrowserRouter>
        <div className="grain min-h-screen bg-cream-50 text-ink-900">
          <AnimatePresence>{s && <Preloader done={l} />}</AnimatePresence>
          <Cursor />
          <ScrollProgress />
          <Nav />
          <PageTransition>
            <main>
              <Routes>
                <Route path="/" element={<HomeC1 />} />
                <Route path="/about" element={<About />} />
                <Route path="/services" element={<Services />} />
                <Route path="/services/:slug" element={<ServiceDetail />} />
                <Route path="/work" element={<Work />} />
                <Route path="/work/:slug" element={<CaseStudy />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/insights" element={<Insights />} />
                <Route path="/insights/:slug" element={<InsightPost />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="*" element={<HomeC1 />} />
              </Routes>
            </main>
            <Footer />
          </PageTransition>
          <BackToTop />
        </div>
      </BrowserRouter>
    )
  );
}
