export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden="true" className="logo-mark">
      <rect width="28" height="28" rx="8" fill="var(--accent)" />
      <path d="M9 8v12h10" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="18.5" cy="10.5" r="2.6" fill="#fff" />
    </svg>
  );
}
