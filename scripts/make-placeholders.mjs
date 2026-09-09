/**
 * Generates every placeholder image the site references, at the correct
 * aspect ratio, from content/works.json, founder.json and site.json.
 *
 *   npm run placeholders
 *
 * Existing files are overwritten, so run it only while you still want
 * placeholders. Replace any file with a real still of the same name and
 * the site picks it up on the next build.
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(new URL(".", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"), "..");
const read = async (f) => JSON.parse(await fs.readFile(path.join(root, "content", f), "utf8"));
const works = await read("works.json");
const founder = await read("founder.json");
const site = await read("site.json");

const PALETTE = [
  ["#ff5c39", "#8b5cff"],
  ["#ff2e7e", "#1b1030"],
  ["#8b5cff", "#ff5c39"],
  ["#ff2e7e", "#ff5c39"],
  ["#3b1d6e", "#ff2e7e"],
  ["#ff5c39", "#2a0f26"],
];

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function svg({ w, h, label, sub, i }) {
  const [a, b] = PALETTE[i % PALETTE.length];
  const big = Math.round(Math.min(w, h) * 0.075);
  const small = Math.round(Math.min(w, h) * 0.034);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${a}" stop-opacity="0.62"/>
      <stop offset="1" stop-color="${b}" stop-opacity="0.85"/>
    </linearGradient>
    <radialGradient id="r" cx="28%" cy="18%" r="75%">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.18"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="#0d0b14"/>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <rect width="100%" height="100%" fill="url(#r)"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${big}" fill="#f4f2f8" fill-opacity="0.92">${esc(label)}</text>
  <text x="50%" y="50%" dy="${Math.round(big * 1.15)}" text-anchor="middle" dominant-baseline="middle" font-family="Arial, Helvetica, sans-serif" font-size="${small}" fill="#f4f2f8" fill-opacity="0.55">${esc(sub)}</text>
</svg>`;
}

const FORCE = process.argv.includes("--force");

/** Writes a placeholder unless a file is already there; pass --force to overwrite real images. */
async function make(file, opts) {
  const abs = path.join(root, "public", file);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  if (!FORCE) {
    try {
      await fs.access(abs);
      return abs;
    } catch {
      /* missing: generate it */
    }
  }
  await sharp(Buffer.from(svg(opts))).jpeg({ quality: 68, mozjpeg: true }).toFile(abs);
  return abs;
}

const SIZE = {
  poster: [800, 1200],
  backdrop: [1920, 1080],
  gallery: [1600, 900],
  portrait: [1200, 1500],
  og: [1200, 630],
};

const isLocal = (p) => typeof p === "string" && p.startsWith("/");

const jobs = [];
works.forEach((w, i) => {
  // Remote images (for example YouTube thumbnails) are left alone.
  if (isLocal(w.poster)) jobs.push(make(w.poster, { w: SIZE.poster[0], h: SIZE.poster[1], label: w.title, sub: "Poster · 2:3 · replace me", i }));
  if (isLocal(w.backdrop)) jobs.push(make(w.backdrop, { w: SIZE.backdrop[0], h: SIZE.backdrop[1], label: w.title, sub: "Backdrop · 16:9 · replace me", i: i + 2 }));
  (w.gallery ?? []).filter(isLocal).forEach((g, n) => {
    jobs.push(make(g, { w: SIZE.gallery[0], h: SIZE.gallery[1], label: `${w.title} · still ${n + 1}`, sub: "Gallery · 16:9 · replace me", i: i + n }));
  });
});
jobs.push(make(founder.portrait, { w: SIZE.portrait[0], h: SIZE.portrait[1], label: founder.name, sub: "Portrait · 4:5 · replace me", i: 4 }));
jobs.push(make(founder.backdrop, { w: SIZE.backdrop[0], h: SIZE.backdrop[1], label: "Founder backdrop", sub: "16:9 · replace me", i: 5 }));
jobs.push(make(site.studioImage, { w: SIZE.portrait[0], h: SIZE.portrait[1], label: "The studio", sub: "Portrait · 4:5 · replace me", i: 2 }));
jobs.push(make(site.ogImage, { w: SIZE.og[0], h: SIZE.og[1], label: site.name, sub: "Open Graph · 1200x630 · replace me", i: 0 }));

const files = await Promise.all(jobs);
let bytes = 0;
for (const f of files) bytes += (await fs.stat(f)).size;
console.log(`${files.length} placeholders written, ${(bytes / 1024).toFixed(0)} KB total`);
