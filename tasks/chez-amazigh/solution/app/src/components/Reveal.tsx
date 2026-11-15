import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

/** Fades content up once as it enters the viewport. Opacity and transform only, so it never moves the layout. */
export default function Reveal({ as: Tag = "div", className = "", children }: { as?: ElementType; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) return setShown(true);
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`reveal ${shown ? "is-shown" : ""} ${className}`.trim()}>
      {children}
    </Tag>
  );
}
