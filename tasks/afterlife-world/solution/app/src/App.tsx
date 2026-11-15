import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Android from "./pages/Android";

const World = lazy(() => import("./pages/World"));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<main className="gate"><p className="gate-loading">Opening the world</p></main>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/android" element={<Android />} />
          <Route path="/world" element={<World />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
