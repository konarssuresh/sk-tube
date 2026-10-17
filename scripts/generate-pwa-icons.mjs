import fs from "node:fs";
import path from "node:path";

import sharp from "sharp";

const root = path.join(import.meta.dirname, "..");
const svgPath = path.join(root, "public", "sktube-logo.svg");
const outDir = path.join(root, "public", "icons");

const sizes = [
  { name: "icon-192x192.png", size: 192, maskable: false },
  { name: "icon-512x512.png", size: 512, maskable: false },
  { name: "icon-maskable-512x512.png", size: 512, maskable: true },
];

fs.mkdirSync(outDir, { recursive: true });
const svg = fs.readFileSync(svgPath);

for (const { name, size, maskable } of sizes) {
  let pipeline = sharp(svg).resize(size, size);

  if (maskable) {
    pipeline = pipeline.extend({
      top: Math.round(size * 0.1),
      bottom: Math.round(size * 0.1),
      left: Math.round(size * 0.1),
      right: Math.round(size * 0.1),
      background: { r: 11, g: 11, b: 15, alpha: 1 },
    });
  }

  await pipeline.png().toFile(path.join(outDir, name));
}

console.log(`Wrote ${sizes.length} icons to public/icons/`);
