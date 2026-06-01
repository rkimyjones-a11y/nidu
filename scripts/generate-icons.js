// Genera los iconos PWA (192 y 512) en public/.
// Uso: node scripts/generate-icons.js
//
// Implementado con sharp (binarios prebuilt; funciona en Windows sin
// build tools). El paquete `canvas` requiere Cairo + VS Build Tools y
// no es viable out-of-the-box, así que renderizamos un SVG y dejamos
// que sharp lo rasterice.

const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const BG = "#16a34a";
const FG = "#ffffff";

function buildSvg(size) {
  const radius = Math.round(size * 0.2);
  const fontSize = Math.round(size * 0.5);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="${BG}"/>
  <text x="50%" y="50%" font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-size="${fontSize}" fill="${FG}" text-anchor="middle" dominant-baseline="central">Nú</text>
</svg>`;
}

async function main() {
  const outDir = path.join(__dirname, "..", "public");
  fs.mkdirSync(outDir, { recursive: true });

  for (const size of [192, 512]) {
    const svg = Buffer.from(buildSvg(size));
    const out = path.join(outDir, `icon-${size}.png`);
    await sharp(svg).png().toFile(out);
    console.log("✓", path.relative(process.cwd(), out));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
