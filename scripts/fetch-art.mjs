/**
 * Pulls each production's artwork off YouTube once and serves it from this
 * site instead of hotlinking it.
 *
 *   npm run art
 *
 * Hotlinked thumbnails cost an extra DNS lookup, TLS handshake and an
 * unoptimised 1280px JPEG on the critical path, which is what was holding
 * the largest contentful paint at over four seconds. Local WebP at the size
 * actually displayed fixes that, and the files are the studio's own artwork.
 *
 * Rewrites content/works.json to point at the local copies. Safe to re-run:
 * anything already local is left alone.
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(new URL(".", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"), "..");
const WORKS = path.join(root, "content", "works.json");
const PUBLIC = path.join(root, "public");

const works = JSON.parse(await fs.readFile(WORKS, "utf8"));
const isRemote = (u) => typeof u === "string" && /^https?:\/\//.test(u);

/** Backdrops fill the hero; posters never render wider than ~250 CSS px. */
const SPECS = {
  backdrop: { dir: "backdrops", width: 1280, quality: 74 },
  poster: { dir: "posters", width: 480, quality: 76 },
};

async function download(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

let fetched = 0;
let bytesBefore = 0;
let bytesAfter = 0;

for (const work of works) {
  for (const [field, spec] of Object.entries(SPECS)) {
    const src = work[field];
    if (!isRemote(src)) continue;

    const rel = `/images/${spec.dir}/${work.slug}.webp`;
    const abs = path.join(PUBLIC, rel);
    await fs.mkdir(path.dirname(abs), { recursive: true });

    try {
      const raw = await download(src);
      await sharp(raw)
        .resize({ width: spec.width, withoutEnlargement: true })
        .webp({ quality: spec.quality })
        .toFile(abs);
      const out = await fs.stat(abs);
      bytesBefore += raw.length;
      bytesAfter += out.size;
      work[field] = rel;
      fetched++;
      console.log(
        `  ${work.slug.padEnd(28)} ${field.padEnd(9)} ${(raw.length / 1024).toFixed(0).padStart(4)} KB -> ${(out.size / 1024).toFixed(0).padStart(4)} KB`,
      );
    } catch (err) {
      console.log(`  ! ${work.slug} ${field}: ${err.message}`);
    }
  }
}

if (fetched) {
  await fs.writeFile(WORKS, `${JSON.stringify(works, null, 2)}\n`);
  const saved = ((1 - bytesAfter / bytesBefore) * 100).toFixed(0);
  console.log(
    `\n${fetched} images now local: ${(bytesBefore / 1048576).toFixed(1)} MB -> ${(bytesAfter / 1048576).toFixed(1)} MB (${saved}% smaller)`,
  );
} else {
  console.log("nothing remote left to fetch");
}
