/**
 * Checks the home page's title, description and social sharing tags against
 * the values they are meant to have, and that none of them carry an em dash.
 *
 *   npm run share:check              reads the built out/index.html
 *   npm run share:check -- <url>     fetches a deployed page instead
 *
 * Exits non-zero on any mismatch so it can gate a deploy.
 */
import fs from "node:fs/promises";

const TITLE = "Durbin Films | Bangla Natok, Web Series and Brand Films";
const DESCRIPTION =
  "Durbin Films is a Dhaka production house making Bangla natok, web series, short films, documentaries and brand films, from script to final cut under one roof.";
const IMAGE = "https://durbinfilms.com/og-image.png";

const EXPECT = [
  ["title", "<title>", TITLE],
  ["name", "description", DESCRIPTION],
  ["property", "og:title", TITLE],
  ["name", "twitter:title", TITLE],
  ["property", "og:description", DESCRIPTION],
  ["name", "twitter:description", DESCRIPTION],
  ["property", "og:type", "website"],
  // The root URL always serialises with its slash; both forms are one address.
  ["property", "og:url", ["https://durbinfilms.com", "https://durbinfilms.com/"]],
  ["property", "og:site_name", "Durbin Films"],
  ["property", "og:image", IMAGE],
  ["name", "twitter:image", IMAGE],
  ["property", "og:image:width", "1200"],
  ["property", "og:image:height", "630"],
  ["name", "twitter:card", "summary_large_image"],
];

const target = process.argv[2];
const html = target ? await (await fetch(target)).text() : await fs.readFile("out/index.html", "utf8");

const decode = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const head = (html.match(/<head[^>]*>([\s\S]*?)<\/head>/i) || [])[1] ?? "";

function read(attr, key) {
  if (attr === "title") return [...head.matchAll(/<title>([^<]*)<\/title>/g)].map((m) => decode(m[1]));
  const re = new RegExp(`<meta\\s+${attr}="${key.replace(/[:.]/g, "\\$&")}"\\s+content="([^"]*)"`, "g");
  return [...head.matchAll(re)].map((m) => decode(m[1]));
}

let failures = 0;
console.log(`checking ${target ?? "out/index.html"}\n`);
for (const [attr, key, want] of EXPECT) {
  const found = read(attr, key);
  const allowed = Array.isArray(want) ? want : [want];
  const ok = found.length === 1 && allowed.includes(found[0]);
  if (!ok) failures++;
  const note = found.length === 0 ? "MISSING" : found.length > 1 ? `DUPLICATED x${found.length}` : "";
  console.log(`${ok ? "ok  " : "FAIL"}  ${key.padEnd(20)} ${note || found[0]}`);
}

const dashed = [...head.matchAll(/<(?:title|meta)[^>]*>/g)]
  .map((m) => m[0])
  .filter((tag) => /(title|description)/i.test(tag) && tag.includes("—"));
console.log(`\nem dashes in title or description tags: ${dashed.length}`);
if (dashed.length) failures++;

console.log(failures ? `\n${failures} problem(s)` : "\nall share tags correct");
// exitCode rather than process.exit(): exiting while fetch's socket is still
// closing trips a libuv assertion on Windows and crashes a passing run.
process.exitCode = failures ? 1 : 0;
