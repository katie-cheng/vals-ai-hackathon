import { useEffect, useState } from "react";
import { usePath } from "./router.tsx";
import { Splash } from "./screens/Splash.tsx";
import { MainMenu } from "./screens/MainMenu.tsx";
import { WorldMap } from "./screens/WorldMap.tsx";
import { LevelSelect } from "./screens/LevelSelect.tsx";
import { LevelIntro } from "./screens/LevelIntro.tsx";
import { Gameplay } from "./screens/Gameplay.tsx";
import { SettingsScreen } from "./screens/Settings.tsx";
import { HowToPlay, About } from "./screens/Info.tsx";
import { Shop } from "./screens/Shop.tsx";
import { Achievements } from "./screens/Achievements.tsx";
import { Daily } from "./screens/Daily.tsx";
import { useSave } from "./state/store.ts";

function route(path: string) {
  const [, a = "", b = ""] = path.replace(/\/+$/, "").split("/");
  switch (a) {
    case "":
      return <MainMenu />;
    case "map":
      return <WorldMap />;
    case "chapter":
      return <LevelSelect chapter={Number(b) || 1} />;
    case "level":
      return <LevelIntro id={Number(b) || 1} />;
    case "play":
      return <Gameplay param={b || "1"} />;
    case "settings":
      return <SettingsScreen />;
    case "how-to-play":
      return <HowToPlay />;
    case "about":
      return <About />;
    case "shop":
      return <Shop />;
    case "achievements":
      return <Achievements />;
    case "daily":
      return <Daily />;
    default:
      return <MainMenu />;
  }
}

export function App() {
  const path = usePath();
  const lang = useSave().settings.language;
  const [splash, setSplash] = useState(true);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return (
    <>
      <div className="route" key={path.split("/")[1] + (path.startsWith("/play") ? path : "")}>
        {route(path)}
      </div>
      {splash && <Splash onDone={() => setSplash(false)} />}
    </>
  );
}
