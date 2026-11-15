import { useEffect, useState } from "react";
import { LOGO, pebbleImg } from "../game/assets.ts";
import { PEBBLE_COLORS } from "../game/logic/types.ts";
import { useT } from "../state/i18n.ts";
import { audio } from "../audio/audio.ts";

const SPLASH_MS = 1200;

export function Splash({ onDone }: { onDone: () => void }) {
  const t = useT();
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const a = setTimeout(() => setLeaving(true), SPLASH_MS);
    const b = setTimeout(onDone, SPLASH_MS + 450);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [onDone]);
  const skip = () => {
    audio.unlock();
    setLeaving(true);
    setTimeout(onDone, 300);
  };
  return (
    <div className={`splash ${leaving ? "splash-leave" : ""}`} onClick={skip} role="presentation">
      <div className="splash-pebbles" aria-hidden="true">
        {PEBBLE_COLORS.map((c, i) => (
          <img key={c} src={pebbleImg(c)} alt="" style={{ left: `${8 + i * 13}%`, animationDelay: `${i * 0.17}s`, animationDuration: `${3 + (i % 3) * 0.6}s` }} />
        ))}
      </div>
      <img className="splash-logo" src={LOGO} alt="Pebble Pop" width={500} height={280} />
      <p className="splash-status">{t("splashLoading")}</p>
      <span className="splash-bar" aria-hidden="true">
        <span />
      </span>
    </div>
  );
}
