import React from "react";
import { BrowserRouter, Link, Route, Routes, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Layout } from "./components/Layout";
import { StoreProvider } from "./lib/store";
import { Home } from "./pages/Home";

const AboutRoute = React.lazy(() => import("./pages/About"));
const AdminRoute = React.lazy(() => import("./pages/Admin"));
const ContactRoute = React.lazy(() => import("./pages/Contact"));
const GalleryRoute = React.lazy(() => import("./pages/Gallery"));
const MenuRoute = React.lazy(() => import("./pages/Menu"));
const OrderRoute = React.lazy(() => import("./pages/Order"));
const PortalRoute = React.lazy(() => import("./pages/Portal"));
const ReviewsRoute = React.lazy(() => import("./pages/Reviews"));
function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}
function PageLoader() {
  return (
    <div className="flex min-h-[65vh] items-center justify-center bg-black pt-24 text-white">
      <div className="text-center">
        <span className="mx-auto block h-1 w-24 overflow-hidden rounded-full bg-white/10">
          <span className="live-dot block h-full w-full bg-brand" />
        </span>
        <p className="mt-4 font-display text-xl font-bold tracking-wider uppercase">Loading the Campus</p>
      </div>
    </div>
  );
}
function NotFound() {
  return (
    <section className="flex min-h-[80vh] items-center justify-center bg-black px-5 pt-28 text-center text-white">
      <div>
        <p className="font-display text-[10rem] leading-none font-black text-brand">404</p>
        <h1 className="font-display text-5xl font-black uppercase">This page left the Campus.</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/50">
          The good news: the kotas are still here. Head back home or find your next favourite on the menu.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-white">
            <ArrowLeft size={15} />
            Back home
          </Link>
          <Link to="/menu" className="btn-primary">
            Explore menu
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
function SiteRoutes() {
  return (
    <React.Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutRoute />} />
        <Route path="/menu" element={<MenuRoute />} />
        <Route path="/order" element={<OrderRoute />} />
        <Route path="/gallery" element={<GalleryRoute />} />
        <Route path="/reviews" element={<ReviewsRoute />} />
        <Route path="/contact" element={<ContactRoute />} />
        <Route path="/login" element={<PortalRoute />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </React.Suspense>
  );
}
export function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route
            path="/admin"
            element={
              <React.Suspense fallback={<PageLoader />}>
                <AdminRoute />
              </React.Suspense>
            }
          />
          <Route
            path="*"
            element={
              <Layout>
                <SiteRoutes />
              </Layout>
            }
          />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}
