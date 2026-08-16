/**
 * One-off script: fetches the Google Fonts CSS for the poster fonts, keeps the
 * latin subset @font-face blocks, downloads the woff2 files into public/fonts
 * and writes a same-origin fonts.css. html-to-image can then read the CSS rules
 * and embed the fonts, so exported PNGs render with the correct typefaces.
 *
 * Run: node scripts/fetch-fonts.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const FONT_DIR = path.join(ROOT, "public", "fonts");

const FAMILIES =
  "family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@500;600;700&display=swap";
const CSS_URL = `https://fonts.googleapis.com/css2?${FAMILIES}`;

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const res = await fetch(CSS_URL, { headers: { "User-Agent": UA } });
if (!res.ok) throw new Error(`CSS fetch failed: ${res.status}`);
const css = await res.text();

// Split into blocks: each @font-face rule plus its trailing subset comment.
const blocks = css.split(/@font-face/).slice(1);
const kept = [];
const urlMap = new Map();

for (const block of blocks) {
  const face = `@font-face${block}`;
  const subset = (face.match(/\/\*\s*([a-z-]+)\s*\*\//) ?? [])[1] ?? "";
  const unicodeRange = (face.match(/unicode-range:\s*([^;]+);/) ?? [])[1] ?? "";
  // Keep only the latin subset (covers all poster text).
  const isLatin =
    subset === "latin" || unicodeRange.trim().startsWith("U+0000-00FF");
  if (!isLatin) continue;

  const urlMatch = face.match(/url\((https:[^)]+\.woff2)\)/);
  if (!urlMatch) continue;
  const remoteUrl = urlMatch[1];
  let local = urlMap.get(remoteUrl);
  if (!local) {
    const name = `font-${urlMap.size + 1}.woff2`;
    const fRes = await fetch(remoteUrl, { headers: { "User-Agent": UA } });
    if (!fRes.ok) throw new Error(`Font fetch failed (${fRes.status}): ${remoteUrl}`);
    await mkdir(FONT_DIR, { recursive: true });
    await writeFile(path.join(FONT_DIR, name), Buffer.from(await fRes.arrayBuffer()));
    local = `/fonts/${name}`;
    urlMap.set(remoteUrl, local);
    console.log("downloaded", name);
  }
  kept.push(face.replace(remoteUrl, local));
}

await writeFile(path.join(FONT_DIR, "fonts.css"), kept.join("\n"));
console.log(`Wrote fonts.css with ${kept.length} @font-face rules (latin subset).`);
