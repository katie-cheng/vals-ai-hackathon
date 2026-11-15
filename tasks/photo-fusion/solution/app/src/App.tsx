import { useEffect, useRef, useState } from "react";
import { Menu, Upload, X } from "lucide-react";
import { Editor, type EditorHandle } from "./components/Editor";
import { HeroDemo } from "./components/HeroDemo";
import { Logo } from "./components/Logo";
import { useReveal } from "./components/useReveal";

const NAV = [
  { href: "#editor", label: "Editor" },
  { href: "#how", label: "How it works" },
  { href: "#faq", label: "FAQ" },
];

const STEPS = [
  { title: "Add your photos", text: "Upload from your phone or computer, or drag files onto the editor. Add as many as you like." },
  { title: "Arrange and style", text: "Pick a horizontal, vertical, grid or collage layout, reorder or remove photos, and set spacing, borders, corners and the background." },
  { title: "Download", text: "Choose the size and PNG or JPG, then save the merged image at full resolution." },
];

const FAQ = [
  { q: "Are my photos uploaded to a server?", a: "No. PHOTO FUSION reads, merges and exports your photos inside your browser. They never leave your device, and closing the tab clears them." },
  { q: "How many photos can I merge?", a: "Two or more, with no fixed limit. Very large sets at 4000 px may take a few seconds to export on older phones." },
  { q: "Which file types work?", a: "Anything your browser can open: JPG, PNG, WebP and GIF everywhere, plus HEIC and AVIF where the browser supports them." },
  { q: "How big is the downloaded image?", a: "You choose the longer side, from 1200 to 4000 px. The editor shows the exact width and height before you download." },
  { q: "Can I get a transparent background?", a: "Yes. Choose the transparent background and download as PNG. JPG has no transparency, so it uses white instead." },
  { q: "Do I need an account?", a: "No. There is no sign-up and nothing to buy. Open the page and start merging." },
];

export default function App() {
  const editor = useRef<EditorHandle>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  useReveal();

  useEffect(() => {
    // Files dropped outside the editor are added instead of opening in the tab.
    const over = (e: DragEvent) => e.preventDefault();
    const drop = (e: DragEvent) => {
      if (e.defaultPrevented) return;
      e.preventDefault();
      if (e.dataTransfer?.files.length) {
        editor.current?.addFiles([...e.dataTransfer.files]);
        document.getElementById("editor")?.scrollIntoView({ behavior: "smooth" });
      }
    };
    window.addEventListener("dragover", over);
    window.addEventListener("drop", drop);
    return () => {
      window.removeEventListener("dragover", over);
      window.removeEventListener("drop", drop);
    };
  }, []);

  const upload = () => {
    document.getElementById("editor")?.scrollIntoView({ behavior: "smooth" });
    editor.current?.openPicker();
  };

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <a href="#top" className="brand" aria-label="PHOTO FUSION home">
            <Logo />
            <span>PHOTO FUSION</span>
          </a>
          <nav aria-label="Main" className={menuOpen ? "is-open" : ""} id="main-nav">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} onClick={() => setMenuOpen(false)}>{n.label}</a>
            ))}
          </nav>
          <button type="button" className="menu-toggle" aria-label="Menu" aria-expanded={menuOpen} aria-controls="main-nav" onClick={() => setMenuOpen((o) => !o)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="container hero-inner">
            <div className="hero-copy">
              <h1>PHOTO FUSION <span className="hero-sub">– Image Merger</span></h1>
              <p className="lead">Combine two or more photos into one image. Lay them side by side, stack them, or build a grid or collage, then download it as a high-quality PNG or JPG.</p>
              <button type="button" className="button upload-big" onClick={upload}>
                <Upload size={24} aria-hidden /> Upload photos
              </button>
              <p className="hero-note">Free, no account, and your photos stay on your device.</p>
            </div>
            <HeroDemo />
          </div>
        </section>

        <section id="editor" className="editor-section">
          <div className="container">
            <div className="section-head reveal">
              <h2>Editor</h2>
              <p>Changes show in the preview straight away. Download when it looks right.</p>
            </div>
            <Editor ref={editor} />
          </div>
        </section>

        <section id="how" className="how">
          <div className="container">
            <h2 className="reveal">How it works</h2>
            <ol className="steps">
              {STEPS.map((s, i) => (
                <li key={s.title} className="reveal" style={{ transitionDelay: `${i * 80}ms` }}>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="faq" className="faq">
          <div className="container narrow">
            <h2 className="reveal">Questions</h2>
            <div className="faq-list reveal">
              {FAQ.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <a href="#top" className="brand light" aria-label="PHOTO FUSION, back to top">
            <Logo />
            <span>PHOTO FUSION</span>
          </a>
          <p>Image Merger that runs entirely in your browser.</p>
          <nav aria-label="Footer">
            {NAV.map((n) => <a key={n.href} href={n.href}>{n.label}</a>)}
          </nav>
        </div>
      </footer>
    </>
  );
}
