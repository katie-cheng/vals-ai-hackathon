import * as React from "react";
import { REDUCED } from "./anim";
import { motion, useScroll, useTransform } from "framer-motion";

function rand(a) {
  const i = Math.sin(a * 127.1 + 311.7) * 43758.5453;
  return i - Math.floor(i);
}

function Bubbles({
  count: a = 26,
  className: i = "",
  color: r = "rgba(125,211,252,0.5)",
  minSize: l = 3,
  maxSize: u = 22,
}) {
  const h = React.useMemo(
    () =>
      Array.from(
        {
          length: a,
        },
        (d, p) => {
          const y = l + rand(p + 1) * (u - l);
          return {
            left: rand(p * 3 + 7) * 100,
            size: y,
            dur: 7 + rand(p * 5 + 3) * 12,
            delay: -rand(p * 7 + 11) * 16,
            dx: (rand(p * 11 + 5) - 0.5) * 160,
            o: 0.25 + rand(p * 13 + 2) * 0.55,
            s: 0.7 + rand(p * 17 + 9) * 0.7,
          };
        },
      ),
    [a, l, u],
  );
  return REDUCED ? null : (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${i}`}
      aria-hidden
    >
      {h.map((d, p) => (
        <span
          key={p}
          className="animate-bubble-rise absolute rounded-full"
          style={{
            left: `${d.left}%`,
            bottom: "-4%",
            width: d.size,
            height: d.size,
            animationDuration: `${d.dur}s`,
            animationDelay: `${d.delay}s`,
            "--dx": `${d.dx}px`,
            "--o": d.o,
            "--s": d.s,
            border: `1.5px solid ${r}`,
            background:
              "radial-gradient(circle at 32% 30%, rgba(255,255,255,.65), transparent 55%)",
            boxShadow: `0 0 ${d.size / 2}px ${r}`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

function DropletsFx({ count: a = 16, className: i = "" }) {
  const r = React.useMemo(
    () =>
      Array.from(
        {
          length: a,
        },
        (l, u) => ({
          left: rand(u * 2 + 4) * 100,
          w: 3 + rand(u + 40) * 7,
          h: 14 + rand(u + 80) * 44,
          dur: 4 + rand(u * 3 + 9) * 7,
          delay: -rand(u * 5 + 1) * 10,
          sway: (rand(u * 7 + 6) - 0.5) * 60,
          o: 0.3 + rand(u + 22) * 0.5,
        }),
      ),
    [a],
  );
  return REDUCED ? null : (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${i}`}
      aria-hidden
    >
      {r.map((l, u) => (
        <span
          key={u}
          className="animate-droplet-roll absolute rounded-full"
          style={{
            left: `${l.left}%`,
            top: 0,
            width: l.w,
            height: l.h,
            opacity: l.o,
            animationDuration: `${l.dur}s`,
            animationDelay: `${l.delay}s`,
            "--sway": `${l.sway}px`,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(186,230,253,.55) 30%, rgba(255,255,255,.85) 50%, rgba(125,211,252,.5) 75%, rgba(255,255,255,0) 100%)",
            filter: "blur(0.4px)",
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

function Gleams({ count: a = 14, className: i = "", color: r = "#fff" }) {
  const l = React.useMemo(
    () =>
      Array.from(
        {
          length: a,
        },
        (u, h) => ({
          left: rand(h * 3 + 21) * 100,
          top: rand(h * 7 + 13) * 100,
          size: 4 + rand(h + 60) * 12,
          delay: -rand(h * 5 + 8) * 4,
          dur: 2.4 + rand(h + 3) * 2.6,
        }),
      ),
    [a],
  );
  return REDUCED ? null : (
    <div className={`pointer-events-none absolute inset-0 ${i}`} aria-hidden>
      {l.map((u, h) => (
        <svg
          key={h}
          className="animate-gleam absolute"
          style={{
            left: `${u.left}%`,
            top: `${u.top}%`,
            width: u.size,
            height: u.size,
            animationDelay: `${u.delay}s`,
            animationDuration: `${u.dur}s`,
          }}
          viewBox="0 0 24 24"
          fill={r}
        >
          <path d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z" />
        </svg>
      ))}
    </div>
  );
}

function ParticleCanvas({ density: a = 70, className: i = "" }) {
  const r = React.useRef(null);
  return (
    React.useEffect(() => {
      if (REDUCED) return;
      const l = r.current;
      if (!l) return;
      const u = l.getContext("2d");
      if (!u) return;
      let h = 0,
        d = 0,
        p = 0;
      const y = Math.min(2, window.devicePixelRatio || 1),
        b = {
          x: -9999,
          y: -9999,
        };
      let v = [];
      const g = () => {
        const M = l.getBoundingClientRect();
        ((d = M.width),
          (p = M.height),
          (l.width = d * y),
          (l.height = p * y),
          u.setTransform(y, 0, 0, y, 0, 0));
        const H = Math.min(a, Math.floor((d * p) / 16e3));
        v = Array.from(
          {
            length: H,
          },
          () => ({
            x: Math.random() * d,
            y: Math.random() * p,
            r: 1 + Math.random() * 3.2,
            vx: (Math.random() - 0.5) * 0.35,
            vy: -0.12 - Math.random() * 0.4,
            o: 0.15 + Math.random() * 0.5,
            ph: Math.random() * Math.PI * 2,
          }),
        );
      };
      g();
      const S = (M) => {
          const H = l.getBoundingClientRect();
          ((b.x = M.clientX - H.left), (b.y = M.clientY - H.top));
        },
        A = () => {
          ((b.x = -9999), (b.y = -9999));
        };
      let E = 0;
      const V = () => {
        ((E += 0.016), u.clearRect(0, 0, d, p));
        for (const M of v) {
          const H = M.x - b.x,
            L = M.y - b.y,
            Y = Math.hypot(H, L);
          if (Y < 130 && Y > 1) {
            const F = ((130 - Y) / 130) * 1.4;
            ((M.x += (H / Y) * F), (M.y += (L / Y) * F));
          }
          ((M.x += M.vx + Math.sin(E * 1.4 + M.ph) * 0.18),
            (M.y += M.vy),
            M.y < -8 && ((M.y = p + 8), (M.x = Math.random() * d)),
            M.x < -8 && (M.x = d + 8),
            M.x > d + 8 && (M.x = -8));
          const O = M.o * (0.7 + 0.3 * Math.sin(E * 2.4 + M.ph)),
            G = u.createRadialGradient(
              M.x - M.r * 0.3,
              M.y - M.r * 0.3,
              0,
              M.x,
              M.y,
              M.r,
            );
          (G.addColorStop(0, `rgba(255,255,255,${O})`),
            G.addColorStop(0.45, `rgba(165,225,255,${O * 0.55})`),
            G.addColorStop(1, "rgba(125,211,252,0)"),
            (u.fillStyle = G),
            u.beginPath(),
            u.arc(M.x, M.y, M.r * 2.2, 0, Math.PI * 2),
            u.fill());
        }
        h = requestAnimationFrame(V);
      };
      return (
        (h = requestAnimationFrame(V)),
        window.addEventListener("resize", g),
        window.addEventListener("mousemove", S, {
          passive: true,
        }),
        document.addEventListener("mouseleave", A),
        () => {
          (cancelAnimationFrame(h),
            window.removeEventListener("resize", g),
            window.removeEventListener("mousemove", S),
            document.removeEventListener("mouseleave", A));
        }
      );
    }, [a]),
    REDUCED ? null : (
      <canvas
        ref={r}
        className={`pointer-events-none absolute inset-0 h-full w-full ${i}`}
        aria-hidden
      />
    )
  );
}

function SprayCanvas({ className: a = "" }) {
  const i = React.useRef(null);
  return (
    React.useEffect(() => {
      if (REDUCED) return;
      const r = i.current;
      if (!r) return;
      const l = r.getContext("2d");
      if (!l) return;
      let u = 0,
        h = 0,
        d = 0;
      const p = Math.min(2, window.devicePixelRatio || 1);
      let y = [];
      const b = () => {
        const S = r.getBoundingClientRect();
        ((h = S.width),
          (d = S.height),
          (r.width = h * p),
          (r.height = d * p),
          l.setTransform(p, 0, 0, p, 0, 0));
      };
      b();
      const v = () => {
          const S = h * 0.08,
            A = d * 0.62;
          for (let E = 0; E < 7; E++) {
            const V = -0.5 + Math.random() * 0.55,
              M = 7 + Math.random() * 7;
            y.push({
              x: S,
              y: A,
              vx: Math.cos(V) * M,
              vy: Math.sin(V) * M,
              life: 0,
              max: 40 + Math.random() * 40,
              r: 0.8 + Math.random() * 2.4,
            });
          }
          y.length > 700 && (y = y.slice(-700));
        },
        g = () => {
          (v(), l.clearRect(0, 0, h, d));
          for (const A of y) {
            (A.life++,
              (A.vy += 0.22),
              (A.vx *= 0.985),
              (A.x += A.vx),
              (A.y += A.vy));
            const E = 1 - A.life / A.max;
            E <= 0 ||
              ((l.fillStyle = `rgba(186,230,253,${0.75 * E})`),
              l.beginPath(),
              l.arc(A.x, A.y, A.r * (0.5 + E), 0, Math.PI * 2),
              l.fill());
          }
          y = y.filter((A) => A.life < A.max && A.y < d + 20);
          const S = l.createLinearGradient(
            h * 0.08,
            d * 0.62,
            h * 0.62,
            d * 0.34,
          );
          (S.addColorStop(0, "rgba(255,255,255,.85)"),
            S.addColorStop(0.5, "rgba(165,225,255,.35)"),
            S.addColorStop(1, "rgba(165,225,255,0)"),
            (l.strokeStyle = S),
            (l.lineWidth = 5),
            (l.lineCap = "round"),
            l.beginPath(),
            l.moveTo(h * 0.08, d * 0.62),
            l.quadraticCurveTo(h * 0.36, d * 0.5, h * 0.62, d * 0.34),
            l.stroke(),
            (u = requestAnimationFrame(g)));
        };
      return (
        (u = requestAnimationFrame(g)),
        window.addEventListener("resize", b),
        () => {
          (cancelAnimationFrame(u), window.removeEventListener("resize", b));
        }
      );
    }, []),
    REDUCED ? null : (
      <canvas
        ref={i}
        className={`pointer-events-none absolute inset-0 h-full w-full ${a}`}
        aria-hidden
      />
    )
  );
}

function ScrollProgress() {
  const { scrollYProgress: a } = useScroll(),
    i = useTransform(a, [0, 1], [0, 1]);
  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-[90] h-[3px] origin-left bg-gradient-to-r from-cyan-300 via-sky-400 to-cyan-200"
      style={{
        scaleX: i,
      }}
      aria-hidden
    />
  );
}

function WaveDivider({
  className: a = "",
  flip: i = false,
  color: r = "#04141f",
  opacity: l = 1,
}) {
  return (
    <div
      className={`pointer-events-none overflow-hidden ${a}`}
      aria-hidden
      style={{
        opacity: l,
      }}
    >
      <div className={`flex w-[200%] ${i ? "rotate-180" : ""}`}>
        {[0, 1].map((u) => (
          <svg
            key={u}
            className="animate-wave-x w-1/2 shrink-0"
            viewBox="0 0 1200 90"
            preserveAspectRatio="none"
            style={{
              animationDuration: u ? "13s" : "9s",
            }}
          >
            <path
              d="M0,55 C150,20 300,85 450,55 C600,25 750,80 900,50 C1050,22 1150,60 1200,45 L1200,90 L0,90 Z"
              fill={r}
              opacity={u ? 0.35 : 0.85}
            />
          </svg>
        ))}
      </div>
    </div>
  );
}

export {
  rand,
  Bubbles,
  DropletsFx,
  Gleams,
  ParticleCanvas,
  SprayCanvas,
  ScrollProgress,
  WaveDivider,
};
