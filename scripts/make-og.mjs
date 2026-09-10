/**
 * Renders the site's share images, built entirely here with sharp.
 *
 *   npm run og
 *
 * Writes:
 *   public/og-image.png         1200 x 630, Open Graph and Twitter
 *   public/og-image-square.png  1200 x 1200, for platforms that crop square
 *
 * Composition, centred as one group: the Durbin Films logo at 420px wide,
 * a 2px x 120px rule in the pink-to-orange accent, then one line of copy in
 * Plus Jakarta Sans, the site's body face, on black with a faint radial lift
 * to #111111 at the edges.
 *
 * The font file lives in scripts/assets so the output never depends on what
 * happens to be installed on the machine running this.
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(new URL(".", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"), "..");
const LOGO = path.join(root, "public", "images", "brand", "logo.png");
const FONT = path.join(root, "scripts", "assets", "PlusJakartaSans-Medium.ttf");

const LINE = "Bangla natok, web series and brand films from Dhaka";
const LOGO_WIDTH = 420;
const RULE = { width: 120, height: 2, from: "#FF2D8A", to: "#FF6A3D" };
const GAP_LOGO_RULE = 40;
const GAP_RULE_TEXT = 30;

function background(width, height) {
  // objectBoundingBox units make the gradient follow the canvas shape, and
  // r ~ 0.71 puts the corners, the farthest points, exactly at #111111.
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="71%">
      <stop offset="0" stop-color="#000000"/>
      <stop offset="0.55" stop-color="#050505"/>
      <stop offset="1" stop-color="#111111"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
</svg>`);
}

function rule() {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${RULE.width}" height="${RULE.height}">
  <defs>
    <linearGradient id="r" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${RULE.from}"/>
      <stop offset="1" stop-color="${RULE.to}"/>
    </linearGradient>
  </defs>
  <rect width="${RULE.width}" height="${RULE.height}" fill="url(#r)"/>
</svg>`);
}

async function textLayer() {
  const escaped = LINE.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const { data, info } = await sharp({
    text: {
      text: `<span foreground="#FFFFFF">${escaped}</span>`,
      font: "Plus Jakarta Sans Medium 28",
      fontfile: FONT,
      rgba: true,
      dpi: 72, // at 72 dpi one point is one pixel, so this is 28px type
    },
  })
    .png()
    .toBuffer({ resolveWithObject: true });
  return { buf: data, width: info.width, height: info.height };
}

async function compose(width, height, parts, out) {
  const { logo, text } = parts;
  const group = logo.height + GAP_LOGO_RULE + RULE.height + GAP_RULE_TEXT + text.height;
  const top = Math.round((height - group) / 2);
  const center = (w) => Math.round((width - w) / 2);

  const logoTop = top;
  const ruleTop = logoTop + logo.height + GAP_LOGO_RULE;
  const textTop = ruleTop + RULE.height + GAP_RULE_TEXT;

  await sharp(background(width, height))
    .composite([
      { input: logo.buf, left: center(logo.width), top: logoTop },
      { input: rule(), left: center(RULE.width), top: ruleTop },
      { input: text.buf, left: center(text.width), top: textTop },
    ])
    .png({ compressionLevel: 9 })
    .toFile(out);

  const margins = {
    top: logoTop,
    bottom: height - (textTop + text.height),
    sides: Math.min(center(logo.width), center(text.width)),
  };
  return margins;
}

const logoBuf = await sharp(LOGO).resize({ width: LOGO_WIDTH }).png().toBuffer({ resolveWithObject: true });
const logo = { buf: logoBuf.data, width: logoBuf.info.width, height: logoBuf.info.height };
const text = await textLayer();

const jobs = [
  ["og-image.png", 1200, 630],
  ["og-image-square.png", 1200, 1200],
];
for (const [name, w, h] of jobs) {
  const out = path.join(root, "public", name);
  const m = await compose(w, h, { logo, text }, out);
  const size = (await fs.stat(out)).size;
  console.log(
    `${name.padEnd(22)} ${w}x${h}  ${(size / 1024).toFixed(0)} KB  margins top ${m.top} bottom ${m.bottom} sides ${m.sides}`,
  );
}
console.log(`logo ${logo.width}x${logo.height}, text ${text.width}x${text.height}`);
