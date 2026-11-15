import { Shell } from "../components/Shell.tsx";
import { LinkButton } from "../components/ui.tsx";
import { boosterImg, pebbleImg, spriteImg } from "../game/assets.ts";
import { PEBBLE_COLORS } from "../game/logic/types.ts";
import { useT } from "../state/i18n.ts";
import { PlayIcon } from "../components/icons.tsx";

export function HowToPlay() {
  const t = useT();
  const steps = [
    { text: t("howTo1"), img: <img src={pebbleImg("blue")} alt="" width={56} height={56} /> },
    { text: t("howTo2"), img: <span className="howto-trio">{(["orange", "orange", "orange"] as const).map((c, i) => <img key={i} src={pebbleImg(c)} alt="" width={34} height={34} />)}</span> },
    { text: t("howTo3"), img: <img src={pebbleImg("yellow")} alt="" width={56} height={56} /> },
    { text: t("howTo4"), img: <img src={spriteImg("star")} alt="" width={56} height={56} /> },
    { text: t("howTo5"), img: <span className="howto-trio">{(["hammer", "swap", "bomb"] as const).map((b) => <img key={b} src={boosterImg(b)} alt="" width={34} height={34} />)}</span> },
    { text: t("howTo6"), img: <span className="howto-trio">{(["frozen", "flower", "stone"] as const).map((b) => <img key={b} src={spriteImg(b)} alt="" width={34} height={34} />)}</span> },
  ];
  return (
    <Shell bg="chapter-mossy" title={t("howToPlay")} back="/settings">
      <section className="parchment page-card">
        <ul className="howto">
          {steps.map((s, i) => (
            <li key={i}>
              <span className="howto-art">{s.img}</span>
              <p>{s.text}</p>
            </li>
          ))}
        </ul>
        <h2 className="section-title">{t("pebblesInLevel")}</h2>
        <ul className="pebble-legend">
          {PEBBLE_COLORS.map((c) => (
            <li key={c}>
              <img src={pebbleImg(c)} alt="" width={44} height={44} />
              <span>{t(c)}</span>
            </li>
          ))}
        </ul>
        <LinkButton to="/map" variant="primary">
          <PlayIcon /> {t("play")}
        </LinkButton>
      </section>
    </Shell>
  );
}

export function About() {
  const t = useT();
  return (
    <Shell bg="chapter-blossom" title={t("about")} back="/settings">
      <section className="parchment page-card about">
        <img src="/assets/ui/app-icon.png" alt="Pebble Pop app icon" width={112} height={112} className="about-icon" />
        <p>{t("aboutText")}</p>
        <p className="about-version">{t("version")}</p>
      </section>
    </Shell>
  );
}
