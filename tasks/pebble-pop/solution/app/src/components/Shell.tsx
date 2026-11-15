import type { ReactNode } from "react";
import { Link } from "../router.tsx";
import { bgImg, envImg } from "../game/assets.ts";
import { useSave } from "../state/store.ts";
import { useT } from "../state/i18n.ts";
import { BackIcon } from "./icons.tsx";
import { Wallet } from "./ui.tsx";

export type Backdrop = Parameters<typeof bgImg>[0];

/** The woodland frame shared by every screen: illustrated background, swaying foreground foliage and a top bar. */
export function Scenery({ bg }: { bg: Backdrop }) {
  return (
    <div className="scenery" aria-hidden="true">
      <img className="scenery-bg" src={bgImg(bg)} alt="" />
      <img className="foliage foliage-left" src={envImg("foliage-left")} alt="" />
      <img className="foliage foliage-right" src={envImg("foliage-right")} alt="" />
      <img className="ferns" src={envImg("ferns-bottom")} alt="" />
    </div>
  );
}

export function Shell({ bg, title, back, children, className = "", headingId }: { bg: Backdrop; title?: string; back?: string; children: ReactNode; className?: string; headingId?: string }) {
  const t = useT();
  const save = useSave();
  return (
    <div className={`screen ${className}`}>
      <Scenery bg={bg} />
      <header className="topbar">
        {back ? (
          <Link to={back} className="icon-btn" aria-label={t("back")}>
            <BackIcon />
          </Link>
        ) : (
          <span className="icon-spacer" />
        )}
        {title ? (
          <h1 className="topbar-title" id={headingId}>
            {title}
          </h1>
        ) : (
          <span />
        )}
        <Wallet acorns={save.acorns} crystals={save.crystals} t={t} />
      </header>
      <main className="screen-body">{children}</main>
    </div>
  );
}
