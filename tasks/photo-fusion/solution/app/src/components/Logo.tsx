export function Logo() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden className="logo-mark">
      <defs>
        <linearGradient id="pf-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5b3df5" />
          <stop offset="1" stopColor="#b25cf6" />
        </linearGradient>
      </defs>
      <rect x="3" y="7" width="15" height="19" rx="3" fill="#0b1838" />
      <rect x="14" y="4" width="15" height="19" rx="3" fill="url(#pf-mark)" />
      <path d="M14 7.5v15.5h4V10.5A3 3 0 0 0 15 7.5z" fill="#ffffff" opacity="0.35" />
    </svg>
  );
}
