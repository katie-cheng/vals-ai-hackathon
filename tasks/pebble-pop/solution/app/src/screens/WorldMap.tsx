import { useEffect, useRef } from "react";
import { Link } from "../router.tsx";
import { Shell } from "../components/Shell.tsx";
import { LockIcon } from "../components/icons.tsx";
import { bgImg, spriteImg } from "../game/assets.ts";
import { CHAPTERS, LEVEL_COUNT } from "../game/levels/index.ts";
import layout from "../ui/mapLayout.json";
import { useSave } from "../state/store.ts";
import { useT } from "../state/i18n.ts";

/** Points spaced evenly along the trail polyline, from the river mouth at the bottom up to the ridge. */
function trailPoints(n: number): { x: number; y: number }[] {
  const pts = layout.path.slice(1, -1);
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = seg.reduce((a, b) => a + b, 0);
  const out = [];
  for (let k = 0; k < n; k++) {
    let d = (total * (k + 0.5)) / n;
    let i = 0;
    while (i < seg.length - 1 && d > seg[i]) d -= seg[i++];
    const f = d / seg[i];
    out.push({ x: pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, y: pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f });
  }
  return out;
}

const NODES = trailPoints(LEVEL_COUNT);

export function WorldMap() {
  const t = useT();
  const save = useSave();
  const current = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    current.current?.scrollIntoView({ block: "center" });
  }, []);
  const pctX = (x: number) => `${(x / layout.width) * 100}%`;
  const pctY = (y: number) => `${(y / layout.height) * 100}%`;
  return (
    <Shell bg="backdrop-wide" title={t("map")} back="/" className="map-screen">
      <div className="map" style={{ aspectRatio: `${layout.width} / ${layout.height}` }}>
        <img className="map-art" src={bgImg("world-map")} alt="" />
        {NODES.map((p, i) => {
          const id = i + 1;
          const open = id <= save.unlocked;
          const isCurrent = id === Math.min(save.unlocked, LEVEL_COUNT);
          const stars = save.stars[id] ?? 0;
          const cls = `map-node ${open ? "" : "map-node-locked"} ${isCurrent ? "map-node-current" : ""} ${stars ? "map-node-done" : ""}`;
          const style = { left: pctX(p.x), top: pctY(p.y) };
          return open ? (
            <Link key={id} to={`/level/${id}`} className={cls} style={style} aria-label={`${t("levelN", { n: id })}${stars ? `, ${stars} / 3` : ""}`} ref={isCurrent ? current : undefined}>
              {id}
            </Link>
          ) : (
            <span key={id} className={cls} style={style} aria-label={`${t("levelN", { n: id })}, ${t("locked")}`} role="img">
              <LockIcon />
            </span>
          );
        })}
        {CHAPTERS.map((c) => {
          const pos = layout.chapters[c.id - 1];
          const open = c.first <= save.unlocked;
          const stars = c.levels.reduce((n, l) => n + (save.stars[l.id] ?? 0), 0);
          return (
            <Link key={c.id} to={`/chapter/${c.id}`} className={`map-sign ${open ? "" : "map-sign-locked"}`} style={{ left: pctX(pos.x), top: pctY(pos.y) }}>
              <span className="map-sign-title">{t(c.key)}</span>
              <span className="map-sign-meta">
                {open ? (
                  <>
                    <img src={spriteImg("star")} alt="" width={18} height={18} /> {stars} / 30
                  </>
                ) : (
                  <>
                    <LockIcon className="inline-icon" /> {t("levelsRange", { a: c.first, b: c.last })}
                  </>
                )}
              </span>
            </Link>
          );
        })}
      </div>
    </Shell>
  );
}
