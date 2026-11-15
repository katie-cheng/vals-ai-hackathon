import { createRoot } from "react-dom/client";
import "@fontsource/fraunces/600.css";
import "@fontsource/fraunces/700.css";
import "@fontsource/nunito/400.css";
import "@fontsource/nunito/600.css";
import "@fontsource/nunito/800.css";
import "./styles.css";
import { App } from "./App.tsx";
import { audio } from "./audio/audio.ts";

addEventListener("pointerdown", () => audio.unlock(), { once: true, capture: true });
addEventListener("keydown", () => audio.unlock(), { once: true, capture: true });

createRoot(document.getElementById("root")!).render(<App />);
