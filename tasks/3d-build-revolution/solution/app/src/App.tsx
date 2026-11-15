import { useEffect, useState } from "react";
import { House3D } from "./House3D";
import { Facade } from "./Facade";
import { Controls, applyPatch } from "./Controls";
import { Peers } from "./Peers";
import { Brief } from "./Brief";
import { Reviews } from "./Reviews";
import { useReveal } from "./useReveal";
import { type Config, DEFAULT_CONFIG, summary, wallHeight } from "./model";

const NAV = [
  { href: "#configurator", label: "Configurator" },
  { href: "#process", label: "Process" },
  { href: "#brief", label: "Your brief" },
  { href: "#reviews", label: "Reviews" },
];

function Logo() {
  return (
    <a className="logo" href="#top" aria-label="3D Build Revolution, home">
      <svg viewBox="0 0 28 28" aria-hidden="true"><path d="M5 13 14 6l9 7v9H5z" /><path d="M14 6v16M5 13l9 4 9-4" opacity=".55" /></svg>
      <span>3D Build Revolution</span>
    </a>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const close = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  return (
    <header className="site-header glass">
      <div className="wrap header-row">
        <Logo />
        <nav className={open ? "nav is-open" : "nav"} id="site-nav" aria-label="Main">
          {NAV.map((n) => <a key={n.href} href={n.href} onClick={() => setOpen(false)}>{n.label}</a>)}
          <a className="button nav-cta" href="#brief" onClick={() => setOpen(false)}>Send a brief</a>
        </nav>
        <button type="button" className="menu-button" aria-expanded={open} aria-controls="site-nav" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((o) => !o)}>
          <svg viewBox="0 0 24 24" aria-hidden="true">{open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 8h16M4 16h16" />}</svg>
        </button>
      </div>
    </header>
  );
}

export default function App() {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [selected, setSelected] = useState<string | null>(null);
  const [peers, setPeers] = useState(true);
  const [heroYaw, setHeroYaw] = useState(24);
  useReveal();
  useEffect(() => {
    const onScroll = () => setHeroYaw(24 + Math.min(window.scrollY, 900) * 0.035);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const set = (fn: (c: Config) => Partial<Config>) => setConfig((c) => applyPatch(c, fn(c)));
  const addWindow = () => {
    const id = `w${Date.now().toString(36)}`;
    set((c) => ({ openings: [...c.openings, { id, kind: "window", x: c.width / 2 - 0.8, y: wallHeight(c) - c.storeyHeight / 2 - 0.65, w: 1.6, h: 1.3 }] }));
    setSelected(id);
  };

  return (
    <>
      <a className="skip" href="#configurator">Skip to the configurator</a>
      <Header />
      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="wrap hero-grid">
            <div className="hero-copy glass">
              <h1 id="hero-title">Design your house in 3D, then we build it.</h1>
              <p className="hero-lede">Construction Revolution: design, build, live better. Shape the roof, windows, walls, floor, height and paint yourself, and send us the design with a brief in your own words.</p>
              <div className="hero-actions">
                <a className="button" href="#configurator">Start designing</a>
                <a className="text-link" href="#process">How we work</a>
              </div>
            </div>
            <div className="hero-visual">
              <House3D config={config} yaw={heroYaw} interactive={false} label={`Your current design: ${summary(config)}`} />
            </div>
          </div>
        </section>

        <section className="section configurator" id="configurator" aria-labelledby="config-title">
          <div className="wrap">
            <div className="section-head" data-reveal>
              <h2 id="config-title">Configure your house</h2>
              <p>Every choice updates the 3D model and the front elevation together. Drag the model to turn it.</p>
            </div>
            <div className="config-grid">
              <aside className="config-panel glass" aria-label="Design options">
                <Controls config={config} set={set} onAddWindow={addWindow} onReset={() => { setConfig(DEFAULT_CONFIG); setSelected(null); }} />
              </aside>
              <div className="stage">
                <div className="stage-view glass">
                  <div className="stage-bar">
                    <h3>3D view</h3>
                    <label className="check check-small">
                      <input type="checkbox" checked={peers} onChange={(e) => setPeers(e.target.checked)} />
                      <span>Show team cursors</span>
                    </label>
                  </div>
                  <div className="stage-canvas">
                    <House3D config={config} label={`3D model of your design: ${summary(config)}. Drag or use the arrow keys to turn it.`} />
                    <Peers on={peers} />
                  </div>
                </div>
                <div className="stage-facade glass">
                  <div className="stage-bar">
                    <h3>Front elevation</h3>
                  </div>
                  <Facade config={config} setConfig={setConfig} selected={selected} setSelected={setSelected} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section process" id="process" aria-labelledby="process-title">
          <div className="wrap">
            <div className="section-head" data-reveal>
              <h2 id="process-title">Design, build, live better</h2>
              <p>One team from the first sketch to the keys.</p>
            </div>
            <div className="process-line" data-reveal aria-hidden="true" />
            <div className="process-grid">
              {[
                ["Design", "Shape the house here and send it with your brief. An architect turns it into drawings you review and sign off before anything is priced."],
                ["Build", "We fix the specification, the price and the programme with you, then build to the drawings you approved, with one site lead as your contact."],
                ["Live better", "You move into the house you configured. The drawings, materials and paint references stay on record for any later change."],
              ].map(([t, d], i) => (
                <article key={t} className="process-step" data-reveal style={{ transitionDelay: `${i * 90}ms` }}>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <Brief config={config} />
        <Reviews />
      </main>
      <footer className="site-footer">
        <div className="wrap footer-row">
          <div>
            <Logo />
            <p>Construction Revolution. Design, build, live better.</p>
          </div>
          <nav aria-label="Footer">
            {NAV.map((n) => <a key={n.href} href={n.href}>{n.label}</a>)}
          </nav>
          <p className="legal">© 2026 3D Build Revolution</p>
        </div>
      </footer>
    </>
  );
}
