/** Initials avatar. The demo accounts have no photos, so none are shown. */
export const Avatar = ({ name, size = "sm" }: { name: string; size?: "sm" | "lg" }) => {
  const initials = name
    .replace(/\(.*?\)/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  return (
    <span
      aria-hidden="true"
      className={`flex flex-none items-center justify-center rounded-full border border-line-strong bg-raised font-medium text-ink-2 ${
        size === "lg" ? "h-[4.5rem] w-[4.5rem] text-xl" : "h-8 w-8 text-[0.8125rem]"
      }`}
    >
      {initials}
    </span>
  );
};
