/**
 * Checks every exported page for the on-page SEO basics.
 *
 *   npm run build && npm run seo
 *
 * Fails loudly rather than silently, so a bad title length or a missing alt
 * shows up before a deploy rather than in Search Console weeks later.
 */
import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve(new URL(".", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"), "..", "out");

const pages = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (entry.name === "index.html") pages.push(p);
  }
})(OUT);

const pick = (html, re) => ((html.match(re) || [])[1] || "").trim();
let bad = 0;

for (const file of pages.sort()) {
  const html = fs.readFileSync(file, "utf8");
  const route = file.slice(OUT.length).replace(/\\/g, "/").replace(/index\.html$/, "") || "/";
  const title = pick(html, /<title>([^<]*)</);
  const desc = pick(html, /<meta name="description" content="([^"]*)"/);
  const canonical = pick(html, /<link rel="canonical" href="([^"]*)"/);
  const og = (html.match(/<meta property="og:/g) || []).length;
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  const jsonLd = (html.match(/application\/ld\+json/g) || []).length;
  const imgsNoAlt = (html.match(/<img (?![^>]*\balt=)[^>]*>/g) || []).length;
  const robots = /noindex/.test(html);

  const problems = [];
  if (!title) problems.push("no title");
  else if (title.length > 70) problems.push(`title ${title.length} chars`);
  if (!desc) problems.push("no description");
  else if (desc.length < 60 || desc.length > 185) problems.push(`description ${desc.length} chars`);
  if (!canonical && !robots) problems.push("no canonical");
  if (og < 4) problems.push(`only ${og} og tags`);
  if (h1 !== 1) problems.push(`${h1} h1 tags`);
  if (jsonLd < 1 && !robots) problems.push("no structured data");
  if (imgsNoAlt) problems.push(`${imgsNoAlt} img without alt`);

  if (problems.length) {
    bad++;
    console.log(`  ! ${route}\n      ${problems.join("; ")}`);
  }
}

console.log(`${pages.length} pages checked`);
if (bad) {
  console.log(`${bad} with problems`);
  process.exit(1);
}
console.log("clean: title, description, canonical, Open Graph, one h1, structured data, alt text");
