export function Logo({ light = false }: { light?: boolean }) {
  return (
    <a href="#home" className="flex shrink-0 items-baseline gap-2.5 whitespace-nowrap" aria-label="SHE Salon & Make-up Studio, back to top">
      <span className={`font-display text-[1.9rem] leading-none font-semibold ${light ? "text-ivory" : "text-ink"}`}>SHE</span>
      <span className={`text-[0.85rem] ${light ? "text-ivory/80" : "text-muted"}`}>Salon &amp; Make-up Studio</span>
    </a>
  );
}
