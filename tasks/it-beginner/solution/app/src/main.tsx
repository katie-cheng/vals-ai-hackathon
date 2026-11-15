import * as React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root")!);
const render = () =>
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );

// First paint waits for the fonts (the two text faces are preloaded in index.html), so text never swaps face and shifts after it is shown.
const fonts = Promise.all([
  document.fonts.load('400 1em "Inter Variable"'),
  document.fonts.load('600 1em "Inter Variable"'),
  document.fonts.load('400 1em "JetBrains Mono"'),
  document.fonts.load("600 1em Cinzel"),
]);
Promise.race([fonts, new Promise((resolve) => setTimeout(resolve, 3000))]).then(render, render);
