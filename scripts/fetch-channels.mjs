/**
 * Reads the live subscriber and video counts for every Durbin channel and
 * writes them to content/channels.json.
 *
 *   npm run channels
 *
 * Run it whenever the numbers on the site start looking stale. Everything
 * published comes from the channel page itself, so nothing is estimated.
 */
import fs from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer-core";

const root = path.resolve(new URL(".", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"), "..");
const OUT = path.join(root, "content", "channels.json");

/** Handle, the label to show, and what the channel is for. */
const CHANNELS = [
  { handle: "@durbinfilmsofficial", label: "DURBIN FILMS", kind: "Drama and telefilm", primary: true },
  { handle: "@DURBINDRAMAOFFICIAL", label: "DURBIN DRAMA", kind: "Natok and serials" },
  { handle: "@DURBINOfficial", label: "DURBIN", kind: "Natok and short films" },
  { handle: "@DurbinMotivation", label: "DURBIN Motivation", kind: "Motivational stories" },
  { handle: "@DurbinShortFilm", label: "DURBIN Shortfilm", kind: "Short films" },
];

/** "1.33M" -> 1330000, "7.66K" -> 7660, "560K" -> 560000. */
function toNumber(text) {
  if (!text) return 0;
  const m = String(text).replace(/,/g, "").match(/^([\d.]+)\s*([KMB])?$/i);
  if (!m) return 0;
  const mult = { K: 1e3, M: 1e6, B: 1e9 }[(m[2] || "").toUpperCase()] ?? 1;
  return Math.round(parseFloat(m[1]) * mult);
}

/** 6_148_000 -> "6.1M", 635 -> "635". */
function human(n) {
  if (n >= 1e6) return `${(Math.floor(n / 1e5) / 10).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1e3) return `${Math.round(n / 1e3)}K`;
  return String(n);
}

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  args: ["--no-first-run", "--lang=en-US,en"],
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const rows = [];
for (const channel of CHANNELS) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });
  try {
    await page.goto(`https://www.youtube.com/${channel.handle}`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await sleep(3200);
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll("button")].find((b) => /reject all|reject/i.test(b.textContent || ""));
      if (btn) btn.click();
    });
    await sleep(1000);

    const read = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        subs: (text.match(/([\d.,]+[KMB]?)\s+subscribers/i) || [])[1] || null,
        videos: (text.match(/([\d.,]+[KMB]?)\s+videos/i) || [])[1] || null,
      };
    });

    const subscribers = toNumber(read.subs);
    const videos = toNumber(read.videos);
    rows.push({
      ...channel,
      url: `https://www.youtube.com/${channel.handle}`,
      subscribers,
      // Show exactly what YouTube shows: re-deriving it turns 1.38M into 1.3M.
      subscribersLabel: read.subs ?? human(subscribers),
      videos,
      videosLabel: read.videos ?? human(videos),
    });
    console.log(`  ${channel.label.padEnd(20)} ${String(read.subs).padStart(7)} subs  ${String(read.videos).padStart(6)} videos`);
  } catch (err) {
    console.log(`  ! ${channel.label}: ${err.message.split("\n")[0]}`);
  }
  await page.close();
}
await browser.close();

rows.sort((a, b) => b.subscribers - a.subscribers);

const totals = {
  channels: rows.length,
  subscribers: rows.reduce((n, r) => n + r.subscribers, 0),
  videos: rows.reduce((n, r) => n + r.videos, 0),
};
totals.subscribersLabel = human(totals.subscribers);
totals.videosLabel = totals.videos.toLocaleString("en-GB");

await fs.writeFile(OUT, `${JSON.stringify({ updated: new Date().toISOString().slice(0, 10), totals, channels: rows }, null, 2)}\n`);
console.log(`\n${totals.channels} channels, ${totals.subscribersLabel} subscribers, ${totals.videos.toLocaleString()} videos`);
console.log(`written to content/channels.json`);
