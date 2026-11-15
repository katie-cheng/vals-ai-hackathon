import type { ReactNode } from "react";
import { type Config, FLOORS, FRAMES, LIMITS, PAINTS, ROOF_COVERINGS, ROOF_FORMS, WALLS, WINDOW_STYLES, clamp, fitOpenings, overallHeight } from "./model";

type Set = (fn: (c: Config) => Partial<Config>) => void;

function Choice<T extends string | number>({ name, legend, value, options, onChange }: {
  name: string;
  legend: string;
  value: T;
  options: { id: T; label: string; color?: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="choice">
      <legend>{legend}</legend>
      <div className="choice-row">
        {options.map((o) => (
          <label key={String(o.id)} className="choice-option">
            <input type="radio" name={name} value={String(o.id)} checked={value === o.id} onChange={() => onChange(o.id)} />
            <span>
              {o.color && <i className="chip" style={{ background: o.color }} aria-hidden="true" />}
              {o.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Swatches({ name, legend, value, options, onChange }: { name: string; legend: string; value: string; options: { id: string; label: string }[]; onChange: (v: string) => void }) {
  const current = options.find((o) => o.id === value);
  return (
    <fieldset className="swatches">
      <legend>
        {legend} <span className="legend-value">{current?.label}</span>
      </legend>
      <div className="swatch-row">
        {options.map((o) => (
          <label key={o.id} className="swatch" title={o.label}>
            <input type="radio" name={name} value={o.id} checked={value === o.id} onChange={() => onChange(o.id)} aria-label={o.label} />
            <span style={{ background: o.id }} />
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Range({ id, label, value, min, max, step, unit, onChange, disabled }: { id: string; label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void; disabled?: boolean }) {
  return (
    <div className="range">
      <label htmlFor={id}>
        {label}
        <output htmlFor={id}>{step < 1 ? value.toFixed(1) : value} {unit}</output>
      </label>
      <input id={id} type="range" min={min} max={max} step={step} value={value} disabled={disabled} onChange={(e) => onChange(clamp(Number(e.target.value), min, max))} />
    </div>
  );
}

function Group({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section className="control-group" id={id} aria-labelledby={`${id}-title`}>
      <h3 id={`${id}-title`}>{title}</h3>
      {children}
    </section>
  );
}

export function Controls({ config, set, onAddWindow, onReset }: { config: Config; set: Set; onAddWindow: () => void; onReset: () => void }) {
  const area = Math.round(config.width * config.depth * config.storeys);
  return (
    <div className="controls">
      <Group id="opt-roof" title="Roof">
        <Choice name="roof" legend="Roof form" value={config.roof} options={ROOF_FORMS} onChange={(roof) => set(() => ({ roof }))} />
        <Range id="pitch" label="Roof pitch" value={config.pitch} min={LIMITS.pitch[0]} max={LIMITS.pitch[1]} step={1} unit="°" disabled={config.roof === "flat"} onChange={(pitch) => set(() => ({ pitch }))} />
        <Swatches name="covering" legend="Covering" value={config.roofCovering} options={ROOF_COVERINGS} onChange={(roofCovering) => set(() => ({ roofCovering }))} />
      </Group>
      <Group id="opt-windows" title="Windows">
        <Choice name="window-style" legend="Window style" value={config.windowStyle} options={WINDOW_STYLES} onChange={(windowStyle) => set(() => ({ windowStyle }))} />
        <Swatches name="frame" legend="Frames" value={config.frame} options={FRAMES} onChange={(frame) => set(() => ({ frame }))} />
        <button type="button" className="button button-quiet" onClick={onAddWindow}>Add a window</button>
      </Group>
      <Group id="opt-walls" title="Walls">
        <Choice name="wall" legend="Wall material" value={config.wall} options={WALLS} onChange={(wall) => set(() => ({ wall }))} />
      </Group>
      <Group id="opt-floor" title="Floor">
        <Choice name="floor" legend="Floor finish" value={config.floor} options={FLOORS.map((f) => ({ id: f.id, label: f.label, color: f.color }))} onChange={(floor) => set(() => ({ floor }))} />
      </Group>
      <Group id="opt-height" title="Height and size">
        <Choice name="storeys" legend="Storeys" value={config.storeys} options={[1, 2, 3].map((n) => ({ id: n, label: String(n) }))} onChange={(storeys) => set(() => ({ storeys }))} />
        <Range id="storey-height" label="Storey height" value={config.storeyHeight} min={LIMITS.storeyHeight[0]} max={LIMITS.storeyHeight[1]} step={0.1} unit="m" onChange={(storeyHeight) => set(() => ({ storeyHeight }))} />
        <Range id="width" label="Width" value={config.width} min={LIMITS.width[0]} max={LIMITS.width[1]} step={0.1} unit="m" onChange={(width) => set(() => ({ width }))} />
        <Range id="depth" label="Depth" value={config.depth} min={LIMITS.depth[0]} max={LIMITS.depth[1]} step={0.1} unit="m" onChange={(depth) => set(() => ({ depth }))} />
      </Group>
      <Group id="opt-paint" title="Paint">
        <Swatches name="paint" legend="Wall colour" value={config.paint} options={PAINTS} onChange={(paint) => set(() => ({ paint }))} />
      </Group>
      <dl className="readout">
        <div><dt>Overall height</dt><dd>{overallHeight(config).toFixed(1)} m</dd></div>
        <div><dt>Floor area</dt><dd>{area} m²</dd></div>
      </dl>
      <button type="button" className="text-button" onClick={onReset}>Reset to the starting design</button>
    </div>
  );
}

export const applyPatch = (c: Config, p: Partial<Config>): Config => {
  const next = { ...c, ...p };
  return { ...next, openings: fitOpenings(next) };
};
