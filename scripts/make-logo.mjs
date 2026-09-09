/**
 * Builds the site's logo files from scripts/assets/logo-source.png.
 *
 *   npm run logo
 *
 * The supplied lockup is white lettering with pure red accents (the play mark
 * inside the "b" and the swoosh). Pure red sits slightly off the site palette,
 * so the red is remapped onto the brand gradient, coral to pink to violet,
 * left to right. Lettering stays the site's off-white.
 *
 * Anti-aliased pixels are blends of red and white, so each pixel is mixed by
 * how much white it already carries. That keeps the edges clean instead of
 * fringing the way a hard threshold would.
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(new URL(".", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"), "..");
const SRC = path.join(root, "scripts", "assets", "logo-source.png");
const OUT = path.join(root, "public", "images", "brand");

/** Brand gradient stops, matching --grad in globals.css. */
const STOPS = [
  { at: 0, rgb: [0xff, 0x5c, 0x39] },
  { at: 0.52, rgb: [0xff, 0x2e, 0x7e] },
  { at: 1, rgb: [0x8b, 0x5c, 0xff] },
];
const INK = [0xf4, 0xf2, 0xf8]; // --color-text

function gradientAt(t) {
  const x = Math.min(Math.max(t, 0), 1);
  for (let i = 1; i < STOPS.length; i++) {
    const a = STOPS[i - 1];
    const b = STOPS[i];
    if (x <= b.at) {
      const k = (x - a.at) / (b.at - a.at || 1);
      return [0, 1, 2].map((c) => Math.round(a.rgb[c] + (b.rgb[c] - a.rgb[c]) * k));
    }
  }
  return STOPS[STOPS.length - 1].rgb;
}

const trimmed = await sharp(SRC).trim().png().toBuffer();
const { data, info } = await sharp(trimmed).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * channels;
    if (data[i + 3] < 8) continue;
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    // Red is (255,0,0) and white is (255,255,255), so the green and blue
    // channels say how much white the pixel carries.
    const white = Math.min(1, (g + b) / 2 / 255);
    // Pixels that are not red-dominant are lettering: leave them as ink.
    const grad = r > g + 8 && r > b + 8 ? gradientAt(x / width) : INK;
    for (let c = 0; c < 3; c++) data[i + c] = Math.round(grad[c] * (1 - white) + INK[c] * white);
  }
}

await fs.mkdir(OUT, { recursive: true });
const recoloured = sharp(data, { raw: { width, height, channels } }).png();
const full = await recoloured.toBuffer();

const jobs = [
  ["logo.png", 1400],
  ["logo-nav.png", 420],
];
for (const [name, w] of jobs) {
  await sharp(full).resize({ width: w }).png({ compressionLevel: 9 }).toFile(path.join(OUT, name));
  const s = await fs.stat(path.join(OUT, name));
  console.log(`${name}  ${w}px wide  ${(s.size / 1024).toFixed(0)} KB`);
}

console.log(`source ${width}x${height}, aspect ${(width / height).toFixed(3)}`);
