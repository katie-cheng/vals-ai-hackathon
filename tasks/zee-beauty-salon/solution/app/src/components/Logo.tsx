/** Wordmark: a fine champagne ring around the Z, with the full name set beside it. */
export function Logo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const ink = tone === "dark" ? "text-charcoal" : "text-ivory";
  return (
    <span className={`flex items-center gap-3 ${ink}`}>
      <span className="grid size-11 place-items-center rounded-full border border-champagne font-display text-2xl leading-none">Z</span>
      <span className="font-display text-[1.45rem] leading-none tracking-[0.01em]">ZEE Beauty Saloon</span>
    </span>
  );
}
