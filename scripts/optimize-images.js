import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputDir = path.join(__dirname, "../public/images/uploads");
const outputDir = path.join(__dirname, "../public/images/optimized");

const sizes = [400, 800, 1200];
const QUALITY = 75;


if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}


function getBaseName(file) {
  return path
    .parse(file)
    .name.toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");
}


function isImage(file) {
  return /\.(jpg|jpeg|png|webp)$/i.test(file);
}

async function processImages() {
  const files = fs.readdirSync(inputDir);

  for (const file of files) {
    if (!isImage(file)) continue;

    const inputPath = path.join(inputDir, file);
    const baseName = getBaseName(file);

    for (const size of sizes) {
      const outputFileName = `${baseName}-${size}.webp`;
      const outputPath = path.join(outputDir, outputFileName);

      if (fs.existsSync(outputPath)) continue;

      try {
        await sharp(inputPath)
          .resize({
            width: size,
            withoutEnlargement: true
          })
          .webp({ quality: QUALITY })
          .toFile(outputPath);

        console.log(`✅ ${file} → ${outputFileName}`);
      } catch (err) {
        console.error(`❌ Error processing ${file}:`, err);
      }
    }
  }
}

processImages();