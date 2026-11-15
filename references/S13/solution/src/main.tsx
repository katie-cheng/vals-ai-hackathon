import * as React from "react";
import * as ReactDOMClient from "react-dom/client";
import "./index.css";
import { App } from "./App";

ReactDOMClient.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

const boot = document.getElementById("boot-loader");
const heroFrame = new Promise((r) => {
  const img = new Image();
  img.onload = img.onerror = r;
  img.src = "/images/hero-wash-first.jpg";
});
Promise.race([
  Promise.all([document.fonts?.ready, heroFrame]),
  new Promise((r) => setTimeout(r, 400)),
]).then(() =>
  requestAnimationFrame(() => {
    document.documentElement.classList.remove("booting");
    boot?.classList.add("done");
    setTimeout(() => boot?.remove(), 300);
  }),
);
