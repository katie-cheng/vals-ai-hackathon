import { Link, NavLink } from "react-router-dom";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="wrap header-row">
        <Link to="/" className="wordmark">AFTERLIFE</Link>
        <nav aria-label="Main" className="site-nav">
          <NavLink to="/android" className="nav-link">Android app</NavLink>
          <Link to="/world" className="btn btn-primary btn-small">Enter the world</Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-row">
        <p className="wordmark wordmark-sm">AFTERLIFE</p>
        <nav aria-label="Footer" className="footer-nav">
          <Link to="/">Home</Link>
          <Link to="/world">The world</Link>
          <Link to="/android">Android app</Link>
        </nav>
        <p className="muted">Runs in Chrome, Safari, Firefox and Edge on phones, tablets and computers.</p>
      </div>
    </footer>
  );
}
