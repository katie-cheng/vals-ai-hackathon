import { useEffect, useState } from "react";

// Three sample photos moving between the layouts the editor offers; it shows what the tool does before anything is uploaded.
const FRAMES = [
  { name: "Horizontal", tiles: [[0, 25, 32, 50], [34, 25, 32, 50], [68, 25, 32, 50]] },
  { name: "Grid", tiles: [[10, 0, 39, 49], [51, 0, 39, 49], [10, 51, 39, 49]] },
  { name: "Collage", tiles: [[0, 5, 59, 90], [61, 5, 39, 44], [61, 51, 39, 44]] },
];
const PHOTOS = ["coast", "forest", "flowers"];

export function HeroDemo() {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setFrame((f) => (f + 1) % FRAMES.length), 3200);
    return () => clearInterval(id);
  }, []);
  const { name, tiles } = FRAMES[frame];
  return (
    <figure className="hero-demo" aria-label={`Example: three photos merged in a ${name.toLowerCase()} layout`}>
      <div className="hero-demo-canvas">
        {tiles.map(([x, y, w, h], i) => (
          <img key={PHOTOS[i]} src={`${import.meta.env.BASE_URL}samples/${PHOTOS[i]}.jpg`} alt="" style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` }} />
        ))}
      </div>
      <figcaption>{name} layout</figcaption>
    </figure>
  );
}
