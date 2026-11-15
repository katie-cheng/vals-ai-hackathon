import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import Mark from "./Mark";

export default function Header() {
  const { pathname } = useLocation();
  const [full, setFull] = useState(false);
  useEffect(() => {
    const onChange = () => setFull(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
  const toggleFull = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else document.documentElement.requestFullscreen?.().catch(() => {});
  };
  return (
    <header className="site-header">
      <div className="wrap header-row">
        <Link to="/" className="brand" aria-label="JCQL scoreboard">
          <Mark />
          <span className="brand-name">JCQL</span>
        </Link>
        <nav className="nav" aria-label="Main">
          <NavLink to="/" end>
            Scoreboard
          </NavLink>
          <NavLink to="/operator">Operator</NavLink>
          {pathname !== "/operator" && (
            <button type="button" className="btn btn-quiet full-btn" onClick={toggleFull} aria-pressed={full}>
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
                {full ? <path d="M6 2v4H2M10 2v4h4M6 14v-4H2M10 14v-4h4" /> : <path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4" />}
              </svg>
              {full ? "Exit full screen" : "Full screen"}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
