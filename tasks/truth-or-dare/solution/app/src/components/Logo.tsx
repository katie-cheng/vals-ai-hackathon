export default function Logo({ size = "small" }: { size?: "small" | "large" }) {
  return (
    <span className={`logo logo-${size}`}>
      <svg viewBox="0 0 16 32" aria-hidden="true">
        <path d="M6 1h4v8l3 5v17H3V14l3-5z" />
      </svg>
      Truth or Dare
    </span>
  );
}
