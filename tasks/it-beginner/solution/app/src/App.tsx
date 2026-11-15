import * as React from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { CourseProvider } from "./context/CourseContext";
import { AuthProvider } from "./context/AuthContext";
import { LoginPage, RegisterPage } from "./pages/AuthPages";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { LandingPage } from "./pages/LandingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { CoursesPage } from "./pages/CoursesPage";
import { LessonPlayerPage } from "./pages/LessonPlayerPage";
import { PlaygroundPage } from "./pages/PlaygroundPage";
import { SearchPage } from "./pages/SearchPage";
import { QuizzesPage } from "./pages/QuizzesPage";
import { QuizDetailPage } from "./pages/QuizDetailPage";
import { CertificatesPage } from "./pages/CertificatesPage";
import { CertificateDetailPage } from "./pages/CertificateDetailPage";
import { ResourcesPage } from "./pages/ResourcesPage";
import { AdminPage } from "./pages/AdminPage";
import { ProfilePage } from "./pages/ProfilePage";

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function App() {
  return (
    <AuthProvider>
    <CourseProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="flex min-h-screen flex-col bg-page text-ink">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/lesson/:id" element={<LessonPlayerPage />} />
              <Route path="/playground" element={<PlaygroundPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/quizzes" element={<QuizzesPage />} />
              <Route path="/quiz/:chapterId" element={<QuizDetailPage />} />
              <Route path="/certificates" element={<CertificatesPage />} />
              <Route path="/certificate/:code" element={<CertificateDetailPage />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="*" element={<LandingPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </CourseProvider>
    </AuthProvider>
  );
}
