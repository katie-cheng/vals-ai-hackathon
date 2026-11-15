import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = (p: P) => ({ width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true, ...p });

export const PauseIcon = (p: P) => (
  <svg {...base(p)}><path d="M9 5v14M15 5v14" strokeWidth={3} /></svg>
);
export const BackIcon = (p: P) => (
  <svg {...base(p)}><path d="M15 5l-7 7 7 7" /></svg>
);
export const NextIcon = (p: P) => (
  <svg {...base(p)}><path d="M9 5l7 7-7 7" /></svg>
);
export const HomeIcon = (p: P) => (
  <svg {...base(p)}><path d="M4 11l8-7 8 7M6 9.5V20h4.5v-5h3v5H18V9.5" /></svg>
);
export const MapIcon = (p: P) => (
  <svg {...base(p)}><path d="M9 4L3.5 6v14L9 18l6 2 5.5-2V4L15 6 9 4zM9 4v14M15 6v14" /></svg>
);
export const GearIcon = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="3.2" /><path d="M12 2.8v2.6M12 18.6v2.6M21.2 12h-2.6M5.4 12H2.8M18.5 5.5l-1.8 1.8M7.3 16.7l-1.8 1.8M18.5 18.5l-1.8-1.8M7.3 7.3L5.5 5.5" /></svg>
);
export const BagIcon = (p: P) => (
  <svg {...base(p)}><path d="M5 8h14l-1.2 12H6.2L5 8zM9 8V6.5a3 3 0 016 0V8" /></svg>
);
export const TrophyIcon = (p: P) => (
  <svg {...base(p)}><path d="M8 4h8v5a4 4 0 01-8 0V4zM8 6H4.5c0 3 1.5 4.5 3.7 4.8M16 6h3.5c0 3-1.5 4.5-3.7 4.8M12 13v4M8.5 20h7M9.5 17h5v3h-5z" /></svg>
);
export const CalendarIcon = (p: P) => (
  <svg {...base(p)}><rect x="4" y="5.5" width="16" height="14.5" rx="2" /><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4M9 14.5l2 2 4-4" /></svg>
);
export const BookIcon = (p: P) => (
  <svg {...base(p)}><path d="M12 6.5C10 5 7 4.6 4 5v13.5c3-.4 6 0 8 1.5 2-1.5 5-1.9 8-1.5V5c-3-.4-6 0-8 1.5zM12 6.5V20" /></svg>
);
export const InfoIcon = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 11v5.5M12 7.6v.2" /></svg>
);
export const LockIcon = (p: P) => (
  <svg {...base(p)}><rect x="5.5" y="10.5" width="13" height="9.5" rx="2" /><path d="M8.5 10.5V8a3.5 3.5 0 017 0v2.5" /></svg>
);
export const PlayIcon = (p: P) => (
  <svg {...base(p)}><path d="M8 5.5v13l10-6.5-10-6.5z" fill="currentColor" /></svg>
);
export const RestartIcon = (p: P) => (
  <svg {...base(p)}><path d="M5 12a7 7 0 107-7H8M8 2l-3 3 3 3" /></svg>
);
export const CloseIcon = (p: P) => (
  <svg {...base(p)}><path d="M6 6l12 12M18 6L6 18" /></svg>
);
export const CheckIcon = (p: P) => (
  <svg {...base(p)}><path d="M5 12.5l4.5 4.5L19 7.5" strokeWidth={3} /></svg>
);
export const MusicIcon = (p: P) => (
  <svg {...base(p)}><path d="M9 17.5V5.5l10-2v12" /><circle cx="6.5" cy="17.5" r="2.5" /><circle cx="16.5" cy="15.5" r="2.5" /></svg>
);
export const SoundIcon = (p: P) => (
  <svg {...base(p)}><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4v-5zM15.5 9a4 4 0 010 6M18 6.5a7.5 7.5 0 010 11" /></svg>
);
export const VibrateIcon = (p: P) => (
  <svg {...base(p)}><rect x="8" y="4" width="8" height="16" rx="1.8" /><path d="M4.5 8.5v7M19.5 8.5v7M2 10.5v3M22 10.5v3" /></svg>
);
export const GlobeIcon = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.6 2.5 3.8 5.5 3.8 9s-1.2 6.5-3.8 9c-2.6-2.5-3.8-5.5-3.8-9S9.4 5.5 12 3z" /></svg>
);
