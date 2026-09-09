/**
 * Renders the default Open Graph share image (1200x630) from site.json:
 * the DURBIN FILMS wordmark, the tagline and the domain on the brand gradient.
 *
 *   npm run og
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(new URL(".", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"), "..");
const site = JSON.parse(await fs.readFile(path.join(root, "content", "site.json"), "utf8"));
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const domain = site.url.replace(/^https?:\/\//, "").replace(/\/$/, "");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ff5c39"/><stop offset="0.52" stop-color="#ff2e7e"/><stop offset="1" stop-color="#8b5cff"/>
    </linearGradient>
    <radialGradient id="a" cx="12%" cy="0%" r="70%"><stop offset="0" stop-color="#ff5c39" stop-opacity="0.35"/><stop offset="1" stop-color="#ff5c39" stop-opacity="0"/></radialGradient>
    <radialGradient id="b" cx="92%" cy="100%" r="70%"><stop offset="0" stop-color="#8b5cff" stop-opacity="0.4"/><stop offset="1" stop-color="#8b5cff" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#0d0b14"/>
  <rect width="1200" height="630" fill="url(#a)"/>
  <rect width="1200" height="630" fill="url(#b)"/>
  <rect x="80" y="238" width="44" height="4" rx="2" fill="url(#g)"/>
  <text x="140" y="246" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" letter-spacing="4" fill="#a6a2b6">DHAKA, BANGLADESH</text>
  <text x="80" y="356" font-family="Arial, Helvetica, sans-serif" font-size="112" font-weight="900" letter-spacing="-4" fill="#f4f2f8">DURBIN <tspan fill="url(#g)">FILMS</tspan></text>
  <text x="80" y="420" font-family="Arial, Helvetica, sans-serif" font-size="34" fill="#d2cede">${esc("Drama, web series and brand films.")}</text>
  <text x="80" y="466" font-family="Arial, Helvetica, sans-serif" font-size="34" fill="#d2cede">${esc("Script to final cut, in house.")}</text>
  <text x="80" y="560" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" letter-spacing="2" fill="#a6a2b6">${esc(domain.toUpperCase())}</text>
</svg>`;

const out = path.join(root, "public", site.ogImage);
await fs.mkdir(path.dirname(out), { recursive: true });
await sharp(Buffer.from(svg)).jpeg({ quality: 82, mozjpeg: true }).toFile(out);
console.log(`wrote ${site.ogImage}`);
