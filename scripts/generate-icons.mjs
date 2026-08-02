import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "icons");
mkdirSync(outDir, { recursive: true });

function makeSvg(size) {
  const pad = size * 0.16;
  const barX = pad;
  const barW = size - pad * 2;
  const barHeights = [0.28, 0.48, 0.36, 0.6, 0.42].map((h) => h * (size - pad * 2));
  const barCount = barHeights.length;
  const gap = barW * 0.08;
  const barWidth = (barW - gap * (barCount - 1)) / barCount;
  const baseline = size - pad;

  const bars = barHeights
    .map((h, i) => {
      const x = barX + i * (barWidth + gap);
      const y = baseline - h;
      return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barWidth.toFixed(1)}" height="${h.toFixed(1)}" rx="${(barWidth * 0.25).toFixed(1)}" fill="#ffffff"/>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="#16a34a"/>
    ${bars}
  </svg>`;
}

const sizes = [192, 512];

for (const size of sizes) {
  const svg = makeSvg(size);
  await sharp(Buffer.from(svg)).png().toFile(path.join(outDir, `icon-${size}.png`));
  console.log(`generated icon-${size}.png`);
}

// Maskable icon with extra safe-zone padding
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#16a34a"/>
  ${makeSvg(512).match(/<rect x=[^]*<\/svg>/)?.[0]?.replace("</svg>", "") ?? ""}
</svg>`;
await sharp(Buffer.from(maskableSvg)).resize(512, 512).png().toFile(path.join(outDir, "icon-maskable-512.png"));
console.log("generated icon-maskable-512.png");

await sharp(Buffer.from(makeSvg(180))).png().toFile(path.join(outDir, "apple-touch-icon.png"));
console.log("generated apple-touch-icon.png");
