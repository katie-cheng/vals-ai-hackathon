import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/inter";
import "@fontsource/fraunces/400.css";
import "@fontsource/fraunces/600.css";
import "./styles.css";
import App from "./App";
import { boot } from "./client/store";
import { registerWorker } from "./client/browserNotify";

void boot();
void registerWorker();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
