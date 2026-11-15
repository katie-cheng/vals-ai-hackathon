import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Download, ImagePlus, Trash2, X } from "lucide-react";
import { plan } from "../editor/layout";
import { downloadBlob, exportBlob, render } from "../editor/render";
import { isImage, loadPhotos, loadSamples, releasePhoto } from "../editor/photos";
import { DEFAULT_SETTINGS, GRADIENTS, SIZES, SOLID_COLORS, type Background, type GradientId, type LayoutKind, type Photo, type Settings } from "../editor/types";
import { LayoutIcon } from "./LayoutIcon";

export interface EditorHandle {
  openPicker: () => void;
  addFiles: (files: File[]) => void;
}

const LAYOUTS: { id: LayoutKind; label: string }[] = [
  { id: "horizontal", label: "Horizontal" },
  { id: "vertical", label: "Vertical" },
  { id: "grid", label: "Grid" },
  { id: "collage", label: "Collage" },
];
const PREVIEW_LONG_SIDE = 1400;

function useNarrow(query: string) {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}

function Segmented<T extends string | number>({ label, value, options, onChange }: { label: string; value: T; options: { id: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="field">
      <span className="field-label" id={`seg-${label}`}>{label}</span>
      <div className="segmented" role="radiogroup" aria-labelledby={`seg-${label}`}>
        {options.map((o) => (
          <button key={String(o.id)} type="button" role="radio" aria-checked={value === o.id} className={value === o.id ? "is-on" : ""} onClick={() => onChange(o.id)}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Slider({ id, label, value, min, max, unit = "px", onChange }: { id: string; label: string; value: number; min: number; max: number; unit?: string; onChange: (v: number) => void }) {
  return (
    <div className="field slider">
      <div className="field-row">
        <label htmlFor={id} className="field-label">{label}</label>
        <output htmlFor={id}>{value} {unit}</output>
      </div>
      <input id={id} type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

export const Editor = forwardRef<EditorHandle>(function Editor(_, ref) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [layoutTick, setLayoutTick] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const stacked = useNarrow("(max-width: 1099px)");
  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => setSettings((s) => ({ ...s, [key]: value }));

  const addFiles = useCallback(async (files: File[]) => {
    const images = files.filter(isImage);
    if (!images.length) {
      setMessage(files.length ? "Those files are not images. Use JPG, PNG, WebP or GIF." : "");
      return;
    }
    setBusy(true);
    const { photos: added, failed } = await loadPhotos(images);
    setPhotos((p) => [...p, ...added]);
    setBusy(false);
    setMessage(failed.length ? `Could not read ${failed.join(", ")}.` : `${added.length} ${added.length === 1 ? "photo" : "photos"} added.`);
  }, []);

  useImperativeHandle(ref, () => ({ openPicker: () => input.current?.click(), addFiles }), [addFiles]);

  const layout = useMemo(() => plan(photos, settings), [photos, settings]);

  useEffect(() => {
    if (!canvas.current || !photos.length) return;
    const scale = Math.min(1, PREVIEW_LONG_SIDE / Math.max(layout.width, layout.height));
    render(canvas.current, photos, { ...settings, format: "png" }, scale, layout);
  }, [photos, settings, layout]);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= photos.length || from === to) return;
    setPhotos((p) => {
      const next = [...p];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };
  const remove = (i: number) => {
    setPhotos((p) => {
      releasePhoto(p[i]);
      return p.filter((_, k) => k !== i);
    });
    setMessage("Photo removed.");
  };
  const clear = () => {
    photos.forEach(releasePhoto);
    setPhotos([]);
    setMessage("All photos removed.");
  };
  const chooseLayout = (id: LayoutKind) => {
    set("layout", id);
    setLayoutTick((t) => t + 1);
  };
  const setBackground = (bg: Background) => set("background", bg);
  const isBg = (bg: Background) => JSON.stringify(bg) === JSON.stringify(settings.background);

  const download = async () => {
    if (!photos.length) return;
    setBusy(true);
    try {
      const blob = await exportBlob(photos, settings);
      downloadBlob(blob, `photo-fusion-${layout.width}x${layout.height}.${settings.format}`);
      setMessage(`Downloaded ${layout.width} × ${layout.height} px ${settings.format.toUpperCase()}.`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "The image could not be exported.");
    } finally {
      setBusy(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) addFiles([...e.dataTransfer.files]);
  };
  const dropProps = {
    onDragOver: (e: React.DragEvent) => {
      if (![...e.dataTransfer.types].includes("Files")) return;
      e.preventDefault();
      setDragOver(true);
    },
    onDragLeave: (e: React.DragEvent) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(false);
    },
    onDrop,
  };

  const usesTiles = settings.layout === "grid" || settings.layout === "collage";
  const vertical = stacked;
  const Earlier = vertical ? ArrowUp : ArrowLeft;
  const Later = vertical ? ArrowDown : ArrowRight;

  return (
    <div className={`workspace${dragOver ? " is-dragging" : ""}`} {...dropProps}>
      <input ref={input} className="visually-hidden" type="file" accept="image/*" multiple aria-label="Choose photos" onChange={(e) => {
        addFiles([...(e.target.files || [])]);
        e.target.value = "";
      }} />

      <section className="panel photos-panel" aria-labelledby="photos-title">
        <div className="panel-head">
          <div className="panel-title">
            <h3 id="photos-title">Photos</h3>
            <span className="count" aria-label={`${photos.length} added`}>{photos.length}</span>
          </div>
          {photos.length > 0 && (
            <button type="button" className="text-button" onClick={clear}>
              <Trash2 size={16} aria-hidden /> Remove all
            </button>
          )}
        </div>
        <div className={`dropzone${photos.length ? " compact" : ""}`}>
          <ImagePlus size={photos.length ? 20 : 28} aria-hidden />
          <p>{photos.length ? "Drop more photos here or" : "Drag and drop photos here, or"}</p>
          <button type="button" className="button secondary" onClick={() => input.current?.click()}>
            Choose files
          </button>
        </div>
        {photos.length === 0 ? (
          <button type="button" className="text-button sample" onClick={async () => { setBusy(true); const s = await loadSamples(); setPhotos((p) => [...p, ...s]); setBusy(false); setMessage("4 sample photos added."); }}>
            Try it with sample photos
          </button>
        ) : (
          <ol className="thumbs">
            {photos.map((p, i) => (
              <li
                key={p.id}
                className={`thumb${dragIndex === i ? " is-moving" : ""}`}
                draggable
                onDragStart={(e) => { setDragIndex(i); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", String(i)); }}
                onDragEnd={() => setDragIndex(null)}
                onDragOver={(e) => { if (dragIndex !== null) { e.preventDefault(); e.stopPropagation(); } }}
                onDrop={(e) => {
                  if (dragIndex === null) return;
                  e.preventDefault();
                  e.stopPropagation();
                  move(dragIndex, i);
                  setDragIndex(null);
                }}
              >
                <img src={p.url} alt={`Photo ${i + 1}: ${p.name}`} draggable={false} />
                <span className="thumb-index" aria-hidden>{i + 1}</span>
                <div className="thumb-tools">
                  <button type="button" aria-label={`Move photo ${i + 1} earlier`} disabled={i === 0} onClick={() => move(i, i - 1)}><Earlier size={16} /></button>
                  <button type="button" aria-label={`Move photo ${i + 1} later`} disabled={i === photos.length - 1} onClick={() => move(i, i + 1)}><Later size={16} /></button>
                  <button type="button" aria-label={`Remove photo ${i + 1}`} onClick={() => remove(i)}><X size={16} /></button>
                </div>
              </li>
            ))}
          </ol>
        )}
        {photos.length > 1 && <p className="hint">Drag a photo onto another to swap places, or use the arrows.</p>}
      </section>

      <section className="preview" aria-labelledby="preview-title">
        <h3 id="preview-title" className="visually-hidden">Preview</h3>
        <div className="stage">
          {photos.length ? (
            <canvas key={layoutTick} ref={canvas} className="preview-canvas" role="img" aria-label={`Merged preview, ${settings.layout} layout, ${photos.length} photos`} />
          ) : (
            <div className="empty">
              <p>Your merged image appears here as soon as you add photos.</p>
            </div>
          )}
        </div>
        <div className="export">
          <p className="dims">{photos.length ? `${layout.width} × ${layout.height} px` : "No photos yet"}</p>
          <Segmented label="Format" value={settings.format} options={[{ id: "png", label: "PNG" }, { id: "jpg", label: "JPG" }]} onChange={(v) => set("format", v)} />
          <button type="button" className="button primary download" disabled={!photos.length || busy} onClick={download}>
            <Download size={18} aria-hidden /> Download
          </button>
        </div>
        <p className="status" role="status" aria-live="polite">{busy ? "Working…" : message}</p>
      </section>

      <section className="panel settings" aria-labelledby="settings-title">
        <h3 id="settings-title">Layout and style</h3>
        <div className="field">
          <span className="field-label" id="layout-label">Layout</span>
          <div className="layouts" role="radiogroup" aria-labelledby="layout-label">
            {LAYOUTS.map((l) => (
              <button key={l.id} type="button" role="radio" aria-checked={settings.layout === l.id} className={settings.layout === l.id ? "is-on" : ""} onClick={() => chooseLayout(l.id)}>
                <LayoutIcon kind={l.id} />
                {l.label}
              </button>
            ))}
          </div>
        </div>
        {settings.layout === "grid" && (
          <Segmented label="Columns" value={settings.columns} options={[{ id: "auto", label: "Auto" }, { id: 2, label: "2" }, { id: 3, label: "3" }, { id: 4, label: "4" }]} onChange={(v) => set("columns", v)} />
        )}
        {usesTiles && (
          <>
            <div className="field">
              <label htmlFor="shape" className="field-label">{settings.layout === "grid" ? "Tile shape" : "Canvas shape"}</label>
              <select id="shape" value={settings.shape} onChange={(e) => set("shape", e.target.value as Settings["shape"])}>
                <option value="original">{settings.layout === "grid" ? "Match photos" : "Landscape 3:2"}</option>
                <option value="square">Square 1:1</option>
                <option value="landscape">Landscape 4:3</option>
                <option value="portrait">Portrait 3:4</option>
              </select>
            </div>
            <Segmented label="Photo fit" value={settings.fit} options={[{ id: "fill", label: "Fill tile" }, { id: "fit", label: "Whole photo" }]} onChange={(v) => set("fit", v)} />
          </>
        )}
        <div className="field">
          <label htmlFor="size" className="field-label">Image size (longer side)</label>
          <select id="size" value={settings.size} onChange={(e) => set("size", Number(e.target.value))}>
            {SIZES.map((s) => <option key={s} value={s}>{s} px</option>)}
          </select>
        </div>
        <Slider id="spacing" label="Spacing" value={settings.spacing} min={0} max={120} onChange={(v) => set("spacing", v)} />
        <Slider id="margin" label="Outer margin" value={settings.margin} min={0} max={160} onChange={(v) => set("margin", v)} />
        <Slider id="border" label="Border width" value={settings.border} min={0} max={60} onChange={(v) => set("border", v)} />
        <div className="field">
          <div className="field-row">
            <label htmlFor="border-color" className="field-label">Border colour</label>
            <input id="border-color" type="color" value={settings.borderColor} onChange={(e) => set("borderColor", e.target.value)} />
          </div>
        </div>
        <Slider id="radius" label="Corner radius" value={settings.radius} min={0} max={120} onChange={(v) => set("radius", v)} />
        <div className="field">
          <span className="field-label" id="bg-label">Background</span>
          <div className="swatches" role="radiogroup" aria-labelledby="bg-label">
            {SOLID_COLORS.map((c) => (
              <button key={c.color} type="button" role="radio" aria-checked={isBg({ kind: "color", color: c.color })} aria-label={c.label} title={c.label} className="swatch" style={{ background: c.color }} onClick={() => setBackground({ kind: "color", color: c.color })} />
            ))}
            {(Object.keys(GRADIENTS) as GradientId[]).map((id) => {
              const g = GRADIENTS[id];
              return <button key={id} type="button" role="radio" aria-checked={isBg({ kind: "gradient", id })} aria-label={g.label} title={g.label} className="swatch" style={{ background: `linear-gradient(${g.angle}deg, ${g.stops[0]}, ${g.stops[1]})` }} onClick={() => setBackground({ kind: "gradient", id })} />;
            })}
            <button type="button" role="radio" aria-checked={isBg({ kind: "transparent" })} aria-label="Transparent (PNG only)" title="Transparent (PNG only)" className="swatch transparent" onClick={() => setBackground({ kind: "transparent" })} />
          </div>
          <div className="field-row custom-color">
            <label htmlFor="bg-color">Custom background colour</label>
            <input id="bg-color" type="color" value={settings.background.kind === "color" ? settings.background.color : "#ffffff"} onChange={(e) => setBackground({ kind: "color", color: e.target.value })} />
          </div>
          {settings.background.kind === "transparent" && settings.format === "jpg" && <p className="hint">JPG has no transparency, so the background exports as white.</p>}
        </div>
        {settings.format === "jpg" && (
          <Slider id="quality" label="JPG quality" value={Math.round(settings.quality * 100)} min={60} max={100} unit="%" onChange={(v) => set("quality", v / 100)} />
        )}
        <button type="button" className="text-button" onClick={() => setSettings({ ...DEFAULT_SETTINGS, format: settings.format })}>Reset style</button>
      </section>
      {dragOver && <div className="drop-overlay" aria-hidden>Drop to add photos</div>}
    </div>
  );
});
