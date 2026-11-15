import { useState } from "react";
import { Shell } from "../components/Shell.tsx";
import { Button } from "../components/ui.tsx";
import { boosterImg, spriteImg } from "../game/assets.ts";
import type { BoosterId } from "../game/logic/types.ts";
import { updateSave, useSave } from "../state/store.ts";
import { useT, type StringKey } from "../state/i18n.ts";
import { audio } from "../audio/audio.ts";

const OFFERS: { id: BoosterId; price: number; help: StringKey }[] = [
  { id: "hammer", price: 60, help: "hammerHelp" },
  { id: "swap", price: 45, help: "swapHelp" },
  { id: "bomb", price: 90, help: "bombHelp" },
];
const BUNDLE_CRYSTALS = 2;

export function Shop() {
  const t = useT();
  const save = useSave();
  const [message, setMessage] = useState<string | null>(null);
  const buy = (id: BoosterId, price: number) => {
    if (save.acorns < price) return setMessage(t("notEnough"));
    audio.play("booster", 0.5);
    updateSave((s) => ({ ...s, acorns: s.acorns - price, boosters: { ...s.boosters, [id]: s.boosters[id] + 1 } }));
    setMessage(`${t(id)}: ${t("bought")}`);
  };
  const buyBundle = () => {
    if (save.crystals < BUNDLE_CRYSTALS) return setMessage(t("notEnough").replace(t("acorns").toLowerCase(), t("crystals").toLowerCase()));
    audio.play("booster", 0.5);
    updateSave((s) => ({ ...s, crystals: s.crystals - BUNDLE_CRYSTALS, boosters: { hammer: s.boosters.hammer + 1, swap: s.boosters.swap + 1, bomb: s.boosters.bomb + 1 } }));
    setMessage(`${t("bundle")}: ${t("bought")}`);
  };
  return (
    <Shell bg="chapter-autumn" title={t("shop")} back="/">
      <section className="parchment page-card">
        <p className="lead">{t("shopIntro")}</p>
        <ul className="shop-list">
          {OFFERS.map((o) => (
            <li key={o.id} className="shop-item">
              <img src={boosterImg(o.id)} alt="" width={64} height={64} />
              <div className="shop-text">
                <h2>{t(o.id)}</h2>
                <p>{t(o.help)}</p>
                <p className="shop-owned">{t("owned", { n: save.boosters[o.id] })}</p>
              </div>
              <Button variant="primary" className="price-btn" disabled={save.acorns < o.price} onClick={() => buy(o.id, o.price)} aria-label={`${t("buy")} ${t(o.id)}, ${o.price} ${t("acorns")}`}>
                <img src={spriteImg("acorn")} alt="" width={22} height={22} />
                {o.price}
              </Button>
            </li>
          ))}
          <li className="shop-item">
            <span className="shop-bundle" aria-hidden="true">
              {(["hammer", "swap", "bomb"] as const).map((b) => (
                <img key={b} src={boosterImg(b)} alt="" width={38} height={38} />
              ))}
            </span>
            <div className="shop-text">
              <h2>{t("bundle")}</h2>
              <p>{t("bundleText")}</p>
            </div>
            <Button variant="primary" className="price-btn" disabled={save.crystals < BUNDLE_CRYSTALS} onClick={buyBundle} aria-label={`${t("buy")} ${t("bundle")}, ${BUNDLE_CRYSTALS} ${t("crystals")}`}>
              <img src={spriteImg("crystal")} alt="" width={22} height={22} />
              {BUNDLE_CRYSTALS}
            </Button>
          </li>
        </ul>
        <p className="status-line" role="status">
          {message}
        </p>
      </section>
    </Shell>
  );
}
