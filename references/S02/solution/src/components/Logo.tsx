/** Wordmark with a small line-drawn mark (an open book under a mortarboard line). No gradient tile, no tag, no sub-label. */
export const Logo = () => (
  <span className="flex items-center gap-2.5 whitespace-nowrap">
    <svg
      viewBox="0 0 28 28"
      className="h-7 w-7 flex-none text-accent"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 4 3.5 9 14 14l10.5-5L14 4Z" />
      <path d="M7.5 11.2v5.6c0 1.9 2.9 3.7 6.5 3.7s6.5-1.8 6.5-3.7v-5.6" />
      <path d="M24.5 9v6.5" />
      <path d="M9 24h10" />
    </svg>
    <span className="text-[1.0625rem] font-semibold tracking-tight text-ink">IT Beginner</span>
  </span>
);
