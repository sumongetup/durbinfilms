/**
 * Keeps content/works.json in step with YouTube.
 *
 *   npm run sync        refresh view counts, release dates and running times,
 *                       then list new uploads on the studio's channels that
 *                       are not on the site yet
 *   npm run sync:dry    same, but do not write works.json
 *
 * Uses only Node's built-in fetch. Each production is looked up by the video
 * in `watchUrl` (or `youtubeId`). New uploads are read from each channel's
 * public RSS feed; they are reported, never added automatically, so titles
 * and credits stay a human decision.
 */
import fs from "node:fs";

const DRY = process.argv.includes("--dry");
const worksUrl = new URL("../content/works.json", import.meta.url);
const siteUrl = new URL("../content/site.json", import.meta.url);
const works = JSON.parse(fs.readFileSync(worksUrl, "utf8"));
const site = JSON.parse(fs.readFileSync(siteUrl, "utf8"));

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const get = async (url) => {
  const res = await fetch(url, { headers: { "user-agent": UA, "accept-language": "en-US,en;q=0.9" } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
};
const pick = (text, re) => (text.match(re) || [])[1] || null;
const decode = (s) => (s || "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

const idOf = (w) => {
  const m = (w.watchUrl || "").match(/(?:youtu\.be\/|[?&]v=)([\w-]{11})/);
  return m ? m[1] : w.youtubeId || "";
};

/** Format like YouTube's own display: 18.7M shows as 18M, 9.66M as 9.6M. */
const fmtViews = (n) => {
  if (n >= 1e7) return `${Math.floor(n / 1e6)}M`;
  if (n >= 1e6) return `${(Math.floor(n / 1e5) / 10).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1e3) return `${Math.floor(n / 1e3)}K`;
  return String(n);
};

let changed = 0;
for (const w of works) {
  const id = idOf(w);
  if (!id) continue;
  try {
    const html = await get(`https://www.youtube.com/watch?v=${id}&hl=en`);
    const viewCount = Number(pick(html, /"viewCount":"(\d+)"/)) || 0;
    const publishDate = pick(html, /"publishDate":"([^"]+)"/);
    const length = Number(pick(html, /"lengthSeconds":"(\d+)"/)) || 0;
    const before = JSON.stringify([w.views, w.released, w.durationSeconds]);
    if (viewCount && w.views !== undefined) w.views = fmtViews(viewCount);
    if (publishDate) w.released = publishDate.slice(0, 10);
    if (length) w.durationSeconds = length;
    const after = JSON.stringify([w.views, w.released, w.durationSeconds]);
    const mark = before === after ? "  " : "* ";
    if (before !== after) changed++;
    console.log(`${mark}${w.slug.padEnd(30)} ${(w.views || "-").padStart(6)}  ${w.released || "-"}  ${length ? `${Math.round(length / 60)} min` : ""}`);
  } catch (e) {
    console.log(`! ${w.slug}: ${e.message}`);
  }
  await sleep(250);
}

if (changed && !DRY) {
  fs.writeFileSync(worksUrl, JSON.stringify(works, null, 2) + "\n");
  console.log(`\nworks.json updated (${changed} changed).`);
} else {
  console.log(changed ? `\n${changed} would change (dry run, nothing written).` : "\nNo changes.");
}

/**
 * Latest uploads of a channel, newest first, read from the channel's Videos
 * page (its initial data lists the most recent uploads as JSON).
 */
async function latestUploads(handle, limit = 12) {
  const html = await get(`https://www.youtube.com/${handle}/videos?hl=en`);
  const ids = [];
  for (const m of html.matchAll(/"videoId":"([\w-]{11})"/g)) {
    if (!ids.includes(m[1])) ids.push(m[1]);
    if (ids.length >= limit) break;
  }
  const unescape = (s) => {
    try {
      return JSON.parse(`"${s}"`);
    } catch {
      return s;
    }
  };
  return ids.map((id) => {
    const at = html.indexOf(`"videoId":"${id}"`);
    const near = html.slice(at, at + 4000);
    // Old markup: "title":{"runs":[{"text":...}]}; new lockup markup: "title":{"content":...}
    // followed by metadata parts such as "1.2M views" and "3 weeks ago".
    const title =
      pick(near, /"title":\{"runs":\[\{"text":"((?:[^"\\]|\\.)*)"/) ||
      pick(near, /"title":\{"content":"((?:[^"\\]|\\.)*)"/) ||
      pick(near, /"accessibility":\{"accessibilityData":\{"label":"((?:[^"\\]|\\.)*)"/) ||
      "";
    const texts = [...near.matchAll(/"content":"((?:[^"\\]|\\.)*)"/g)].map((m) => unescape(m[1]));
    const age = pick(near, /"publishedTimeText":\{"simpleText":"([^"]+)"/) || texts.find((t) => /\bago\b/.test(t)) || "";
    return { id, title: decode(unescape(title)).replace(/\s+/g, " ").trim(), age };
  });
}

const known = new Set(works.flatMap((w) => [idOf(w), w.youtubeId]).filter(Boolean));
console.log("\nNew uploads not on the site yet:");
for (const ch of site.youtubeChannels || []) {
  try {
    const latest = await latestUploads(ch.handle);
    const fresh = latest.filter((e) => !known.has(e.id));
    console.log(`  ${ch.label} (${ch.handle}): ${fresh.length} of the latest ${latest.length}`);
    for (const e of fresh) console.log(`    ${(e.age || "").padEnd(14)} https://youtu.be/${e.id}  ${e.title}`);
  } catch (e) {
    console.log(`  ${ch.label}: ${e.message}`);
  }
  await sleep(250);
}
