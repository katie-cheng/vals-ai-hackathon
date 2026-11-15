import { blob, grain, svg } from "./common.mjs";
import { pebble } from "./sprites.mjs";

const embed = (markup) => `data:image/svg+xml;base64,${Buffer.from(markup).toString("base64")}`;
const pebbleAt = (name, x, y, s, rot = 0) => `<image href="${embed(pebble(name))}" x="${x}" y="${y}" width="${s}" height="${s}" transform="rotate(${rot} ${x + s / 2} ${y + s / 2})"/>`;

export function logo() {
  const w = 1000, h = 560;
  const board = "M70,190 Q60,150 110,146 L890,140 Q940,144 932,190 L924,368 Q920,410 876,410 L124,414 Q78,412 76,370Z";
  return svg(
    w,
    h,
    `<path d="M210,40 L250,150 M790,40 L750,150" stroke="#a8844f" stroke-width="12" stroke-linecap="round"/>
     <path d="${board}" fill="rgba(30,20,10,0.3)" transform="translate(6 12)"/>
     <path d="${board}" fill="#9a6438" stroke="#4a2c14" stroke-width="10"/>
     <rect width="${w}" height="${h}" filter="url(#lg)" fill="#fff" clip-path="url(#lc)"/>
     <path d="M100,236 Q500,226 900,232 M96,318 Q500,312 904,320" stroke="#7a4d28" stroke-width="5" fill="none"/>
     <path d="${blob(90, 160, 80, 40, 0.4, 3, 11)}" fill="#3f7a35"/><path d="${blob(140, 140, 60, 28, 0.4, 4, 10)}" fill="#5f9a3a"/>
     <path d="${blob(900, 400, 80, 36, 0.4, 5, 11)}" fill="#3f7a35"/><path d="${blob(850, 420, 54, 24, 0.4, 6, 10)}" fill="#77ad4a"/>
     <text x="500" y="262" text-anchor="middle" font-family="Fraunces" font-weight="800" font-size="138" fill="#fff4dc" stroke="#3a2412" stroke-width="16" paint-order="stroke" letter-spacing="1">Pebble</text>
     <text x="512" y="388" text-anchor="middle" font-family="Fraunces" font-weight="800" font-size="128" fill="#f6b35a" stroke="#3a2412" stroke-width="16" paint-order="stroke">Pop</text>
     ${pebbleAt("blue", 150, 290, 110, -12)}${pebbleAt("pink", 735, 286, 104, 10)}
     ${pebbleAt("orange", 230, 420, 120, -6)}${pebbleAt("green", 340, 440, 104, 14)}${pebbleAt("yellow", 440, 428, 120, 0)}${pebbleAt("red", 555, 442, 104, -10)}${pebbleAt("purple", 652, 422, 118, 8)}`,
    `${grain("lg", 0.3, 0.55)}<clipPath id="lc"><path d="${board}"/></clipPath>`,
  );
}

export function appIcon(size) {
  return svg(
    size,
    size,
    `<rect width="512" height="512" rx="110" fill="#2f5634"/>
     <path d="M0,330 Q140,280 256,320 Q380,360 512,300 L512,402 Q512,512 402,512 L110,512 Q0,512 0,402Z" fill="#4f7d4c"/>
     <circle cx="390" cy="120" r="54" fill="#f6d78c" opacity="0.9"/>
     <path d="M120,150 Q120,130 140,130 L372,130 Q392,130 392,150 L398,412 Q398,446 364,446 L148,446 Q114,446 114,412Z" fill="#d9eef6" opacity="0.35" stroke="#f4fbfe" stroke-width="12"/>
     <path d="M108,140 Q256,156 404,140" stroke="#a8844f" stroke-width="16" fill="none"/>
     ${pebbleAt("orange", 132, 330, 118, -8)}${pebbleAt("blue", 250, 334, 116, 6)}${pebbleAt("pink", 190, 230, 116, 12)}${pebbleAt("green", 300, 236, 92, -10)}
     <path d="M146,180 Q140,300 150,410" stroke="#fff" stroke-width="12" opacity="0.4" fill="none" stroke-linecap="round"/>`,
  );
}
