import React from "react";
import { BrowserRouter, Link, Route, Routes, useLocation } from "react-router-dom";
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
    <div className="flex min-h-screen items-center justify-center bg-black" role="status" aria-label="Loading">
      <span className="loader-ring" />
    </div>
  );
}
function NotFound() {
  return (
    <section className="flex min-h-[70vh] items-center bg-black pt-28 pb-16 text-white">
      <div className="container-site">
        <h1 className="page-title">This page left the Campus.</h1>
        <p className="mt-3 max-w-md text-[15px] leading-7 text-white/75">
          The good news: the kotas are still here. Head back home or find your next favourite on the menu.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link to="/menu" className="btn-primary">
            Explore menu
          </Link>
          <Link to="/" className="btn-white">
            Back home
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
