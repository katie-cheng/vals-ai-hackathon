import { photos, type PhotoKey } from "../config/gallery";
import { useLang } from "../i18n/LanguageContext";

type Props = { name: PhotoKey; className?: string; eager?: boolean; sizes?: string };

/** A family photograph with its intrinsic size reserved, so images never shift the layout as they load. */
export default function Photo({ name, className, eager, sizes }: Props) {
  const { t } = useLang();
  const p = photos[name];
  return (
    <img
      className={className}
      src={p.src}
      width={p.width}
      height={p.height}
      alt={t.gallery.captions[name]}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      sizes={sizes}
      {...(eager ? { fetchPriority: "high" as const } : {})}
    />
  );
}
