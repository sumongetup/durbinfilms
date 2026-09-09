/**
 * Renders the default Open Graph share image (1200x630) from site.json and
 * the brand logo built by `npm run logo`.
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

const W = 1200;
const H = 630;

const background = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ff5c39"/><stop offset="0.52" stop-color="#ff2e7e"/><stop offset="1" stop-color="#8b5cff"/>
    </linearGradient>
    <radialGradient id="a" cx="12%" cy="0%" r="70%"><stop offset="0" stop-color="#ff5c39" stop-opacity="0.34"/><stop offset="1" stop-color="#ff5c39" stop-opacity="0"/></radialGradient>
    <radialGradient id="b" cx="92%" cy="100%" r="70%"><stop offset="0" stop-color="#8b5cff" stop-opacity="0.4"/><stop offset="1" stop-color="#8b5cff" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#0d0b14"/>
  <rect width="${W}" height="${H}" fill="url(#a)"/>
  <rect width="${W}" height="${H}" fill="url(#b)"/>
  <rect x="80" y="150" width="44" height="4" rx="2" fill="url(#g)"/>
  <text x="140" y="158" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" letter-spacing="4" fill="#a6a2b6">DHAKA, BANGLADESH</text>
  <text x="80" y="428" font-family="Arial, Helvetica, sans-serif" font-size="32" fill="#d2cede">${esc("Drama, web series, short films and documentary.")}</text>
  <text x="80" y="472" font-family="Arial, Helvetica, sans-serif" font-size="32" fill="#d2cede">${esc("Script to final cut, in house.")}</text>
  <text x="80" y="556" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" letter-spacing="2" fill="#a6a2b6">${esc(domain.toUpperCase())}</text>
</svg>`;

const logo = await sharp(path.join(root, "public", "images", "brand", "logo.png"))
  .resize({ width: 560 })
  .toBuffer();

const out = path.join(root, "public", site.ogImage);
await fs.mkdir(path.dirname(out), { recursive: true });
await sharp(Buffer.from(background))
  .composite([{ input: logo, left: 80, top: 196 }])
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile(out);

const stat = await fs.stat(out);
console.log(`wrote ${site.ogImage}  ${W}x${H}  ${(stat.size / 1024).toFixed(0)} KB`);
