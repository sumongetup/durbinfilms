/**
 * Renders app/icon.svg at the sizes a browser actually uses, so a favicon
 * can be judged at 16px rather than at 512px where anything looks fine.
 *
 *   node scripts/preview-icon.mjs <outDir>
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(new URL(".", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"), "..");
const svg = await fs.readFile(path.join(root, "app", "icon.svg"));
const out = process.argv[2] ?? root;

const SIZES = [16, 32, 48, 180];
const tiles = [];
for (const size of SIZES) {
  const buf = await sharp(svg, { density: 384 }).resize(size, size).png().toBuffer();
  tiles.push({ size, buf });
  console.log(`rendered ${size}x${size}`);
}

// One sheet: each size shown actual-size and blown up next to it.
const PAD = 24;
const ROW = 200;
const width = 720;
const height = PAD * 2 + ROW * SIZES.length;
const layers = [];
let y = PAD;
for (const { size, buf } of tiles) {
  layers.push({ input: buf, left: PAD, top: y + Math.round((ROW - size) / 2) });
  const big = await sharp(buf).resize(160, 160, { kernel: "nearest" }).png().toBuffer();
  layers.push({ input: big, left: PAD + 220, top: y + 10 });
  y += ROW;
}
await sharp({ create: { width, height, channels: 4, background: "#f2f2f5" } })
  .composite(layers)
  .png()
  .toFile(path.join(out, "icon-preview.png"));
console.log("wrote icon-preview.png");
