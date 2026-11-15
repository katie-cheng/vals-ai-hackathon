import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Footer } from "./components/Footer";
import { Nav } from "./components/Nav";
import { PageTransition } from "./components/PageTransition";
import { Preloader } from "./components/Preloader";
import { ScrollProgress } from "./components/shared";
import { About } from "./pages/About";
import { Contact } from "./pages/Contact";
import { Home } from "./pages/Home";
import { InsightPost, Insights } from "./pages/Insights";
import { Pricing } from "./pages/Pricing";
import { ServiceDetail, Services } from "./pages/Services";
import { CaseStudy, Work } from "./pages/Work";

export function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-cream-50 text-ink-900">
        <Preloader />
        <Nav />
        <ScrollProgress />
        <PageTransition>
          <main className="pt-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:slug" element={<ServiceDetail />} />
              <Route path="/work" element={<Work />} />
              <Route path="/work/:slug" element={<CaseStudy />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/insights/:slug" element={<InsightPost />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </main>
          <Footer />
        </PageTransition>
      </div>
    </BrowserRouter>
  );
}
