import { useEffect, useState } from "react";

/** A plain ring while the fonts load (at most 400ms), then the page fades in. No text, no counter. */
export function Preloader() {
  const [state, setState] = useState<"loading" | "fading" | "gone">("loading");
  useEffect(() => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setState("fading");
      setTimeout(() => setState("gone"), 200);
    };
    const cap = setTimeout(finish, 400);
    document.fonts.ready.then(finish);
    return () => clearTimeout(cap);
  }, []);
  if (state === "gone") return null;
  return (
    <div
      className={`fixed inset-0 z-[90] grid place-items-center bg-cream-50 transition-opacity ${state === "fading" ? "opacity-0" : "opacity-100"}`}
      role="status"
      aria-label="Loading"
    >
      <span className="loader-ring" />
    </div>
  );
}
