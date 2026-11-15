/**
 * Renders the hand-authored SVG artwork in tools/art into the game's raster assets:
 * transparent PNG sprites and WebP backgrounds under public/assets.
 * Needs Playwright: `PLAYWRIGHT_MODULE_DIR=/path/with/node_modules npm run assets`.
 */
import { createRequire } from "node:module";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as sprites from "./art/sprites.mjs";
import * as scene from "./art/scenery.mjs";
import { worldMap } from "./art/map.mjs";
import { appIcon, logo } from "./art/brand.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "..", "public", "assets");
const req = createRequire(join(process.env.PLAYWRIGHT_MODULE_DIR ?? here, "node_modules", "noop.js"));
const { chromium } = req("playwright");

const font = (w) => readFileSync(join(here, "..", "node_modules", "@fontsource", "fraunces", "files", `fraunces-latin-${w}-normal.woff2`)).toString("base64");
const css = `@font-face{font-family:Fraunces;font-weight:800;src:url(data:font/woff2;base64,${font(800)}) format("woff2")}
@font-face{font-family:Fraunces;font-weight:600;src:url(data:font/woff2;base64,${font(600)}) format("woff2")}
html,body{margin:0;background:transparent}svg{display:block}`;

const jobs = [];
const add = (file, markup, quality) => jobs.push({ file, markup, quality });

for (const name of Object.keys(sprites.PEBBLES)) add(`pebbles/${name}.png`, sprites.pebble(name));
add("sprites/frozen.png", sprites.frozen());
add("sprites/stone.png", sprites.stone(false));
add("sprites/stone-cracked.png", sprites.stone(true));
add("sprites/flower.png", sprites.flowerObstacle());
add("sprites/lock.png", sprites.lock());
add("sprites/crystal.png", sprites.crystal());
add("sprites/star.png", sprites.star(false));
add("sprites/star-empty.png", sprites.star(true));
add("sprites/acorn.png", sprites.acorn());
add("sprites/medal.png", sprites.medal());
add("boosters/hammer.png", sprites.hammer());
add("boosters/swap.png", sprites.swap());
add("boosters/bomb.png", sprites.bomb());
add("effects/sparkle.png", sprites.sparkle());
add("effects/leaf.png", sprites.leafParticle());
add("effects/petal.png", sprites.petalParticle());
add("effects/snow.png", sprites.snowParticle());
add("effects/ring.png", sprites.ring());
add("jar/jar-back.png", scene.jarBack());
add("jar/jar-front.png", scene.jarFront());
add("jar/jar-base.png", scene.jarBase());
add("environment/foliage-left.png", scene.foliageSide(360, 1400, "left"));
add("environment/foliage-right.png", scene.foliageSide(360, 1400, "right"));
add("environment/ferns-bottom.png", scene.fernsBottom(1200, 300));
add("backgrounds/menu-forest.webp", scene.landscape(1080, 1920, "mossy", { seed: 3 }), 0.82);
add("backgrounds/backdrop-wide.webp", scene.landscape(1920, 1080, "mossy", { seed: 5, horizon: 0.5, trees: [[0.05, 0.75, 1.1], [0.95, 0.74, 1.2], [0.2, 0.62, 0.7], [0.8, 0.6, 0.7], [0.33, 0.58, 0.5], [0.67, 0.58, 0.5]] }), 0.8);
for (const key of ["mossy", "frost", "blossom", "autumn"]) add(`backgrounds/chapter-${key}.webp`, scene.landscape(1080, 1920, key, { seed: 11, fallX: 0.36 }), 0.8);
add("backgrounds/world-map.webp", worldMap(), 0.82);
add("textures/parchment.webp", scene.parchment(), 0.85);
add("textures/wood.webp", scene.wood(), 0.85);
add("ui/logo.png", logo());
add("ui/app-icon.png", appIcon(512));

const browser = await chromium.launch();
const page = await browser.newPage();
for (const job of jobs) {
  const size = job.markup.match(/width="(\d+)" height="(\d+)"/);
  const [w, h] = [Number(size[1]), Number(size[2])];
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(`<style>${css}</style>${job.markup}`);
  await page.evaluate(() => document.fonts.ready);
  const png = await page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: w, height: h } });
  let data = png;
  if (job.file.endsWith(".webp")) {
    const b64 = await page.evaluate(async ([src, q]) => {
      const img = new Image();
      img.src = src;
      await img.decode();
      const c = document.createElement("canvas");
      c.width = img.width;
      c.height = img.height;
      c.getContext("2d").drawImage(img, 0, 0);
      return c.toDataURL("image/webp", q).split(",")[1];
    }, [`data:image/png;base64,${png.toString("base64")}`, job.quality]);
    data = Buffer.from(b64, "base64");
  }
  const target = join(out, job.file);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, data);
  console.log(`${job.file}  ${(data.length / 1024).toFixed(0)} KB`);
}
await browser.close();
