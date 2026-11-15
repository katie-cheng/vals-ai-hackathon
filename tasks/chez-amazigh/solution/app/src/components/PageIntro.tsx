import type { ReactNode } from "react";
import type { PhotoKey } from "../config/gallery";
import Photo from "./Photo";

/** Opening of an inner page: title and lead beside a single photograph. */
export default function PageIntro({ title, lead, photo, children }: { title: string; lead: string; photo?: PhotoKey; children?: ReactNode }) {
  return (
    <header className={`page-intro ${photo ? "has-photo" : ""}`}>
      <div className="page-intro-text">
        <h1>{title}</h1>
        <p className="lead">{lead}</p>
        {children}
      </div>
      {photo && (
        <figure className="page-intro-photo">
          <Photo name={photo} eager />
        </figure>
      )}
    </header>
  );
}
