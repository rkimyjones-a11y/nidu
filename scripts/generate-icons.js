// Genera los iconos PWA (192 y 512) a partir de public/Nidu_logo.png.
// Uso: node scripts/generate-icons.js
//
// Sharp se usa porque sus binarios prebuilt funcionan en Windows sin
// build tools; el paquete `canvas` no es viable out-of-the-box.

const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const SRC = path.join(__dirname, "..", "public", "Nidu_logo2.png");
const OUT_DIR = path.join(__dirname, "..", "public");

async function main() {
  if (!fs.existsSync(SRC)) {
    throw new Error(`No encuentro el logo fuente en ${SRC}`);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const size of [192, 512]) {
    const out = path.join(OUT_DIR, `icon-${size}.png`);
    await sharp(SRC)
      // contain + fondo blanco: si en el futuro el logo no es cuadrado
      // queda centrado con padding blanco en vez de recortarse.
      .resize(size, size, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .png()
      .toFile(out);
    console.log("✓", path.relative(process.cwd(), out));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
