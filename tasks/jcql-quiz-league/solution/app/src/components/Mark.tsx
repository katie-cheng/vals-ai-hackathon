/** JCQL mark: a transmitter with two radio arcs, after J. C. Bose's work on radio waves. */
export default function Mark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="mark">
      <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <path d="M7 16a9 9 0 0 1 9 9" />
        <path d="M7 8a17 17 0 0 1 17 17" opacity="0.55" />
      </g>
      <circle cx="8" cy="24" r="2.8" fill="currentColor" />
    </svg>
  );
}
