import fs from "fs";
import path from "path";
import sharp from "sharp";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputDir = path.join(__dirname, "../public/images/uploads");
const outputDir = path.join(__dirname, "../public/images/optimized");
const publicManifestPath = path.join(outputDir, "manifest.json");
const generatedDir = path.join(__dirname, "../src/generated");
const importableManifestPath = path.join(generatedDir, "image-manifest.json");
const importableManifestModulePath = path.join(generatedDir, "image-manifest.js");

const sizes = [
  { width: 400, key: "small" },
  { width: 800, key: "medium" },
  { width: 1200, key: "large" },
];
const QUALITY = 75;

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

if (!fs.existsSync(generatedDir)) {
  fs.mkdirSync(generatedDir, { recursive: true });
}

function getSafeStem(file) {
  return path
    .parse(file)
    .name.toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
    .replace(/^-+|-+$/g, "");
}

function getContentHash(inputPath) {
  return crypto
    .createHash("sha1")
    .update(fs.readFileSync(inputPath))
    .digest("hex")
    .slice(0, 10);
}

function getBaseName(file, inputPath) {
  const safeStem = getSafeStem(file);
  const hash = getContentHash(inputPath);
  return safeStem ? `${safeStem}-${hash}` : hash;
}

function isImage(file) {
  return /\.(jpg|jpeg|png|webp)$/i.test(file);
}

async function processImages() {
  const files = fs.readdirSync(inputDir);
  const manifest = {};

  for (const file of files) {
    if (!isImage(file)) continue;

    const inputPath = path.join(inputDir, file);
    const baseName = getBaseName(file, inputPath);
    const uploadUrl = `/images/uploads/${file}`;
    manifest[uploadUrl] = {};

    for (const { width, key } of sizes) {
      const outputFileName = `${baseName}-${width}.webp`;
      const outputPath = path.join(outputDir, outputFileName);
      const outputUrl = `/images/optimized/${outputFileName}`;

      manifest[uploadUrl][key] = outputUrl;

      if (fs.existsSync(outputPath)) continue;

      try {
        await sharp(inputPath)
          .resize({
            width,
            withoutEnlargement: true,
          })
          .webp({ quality: QUALITY })
          .toFile(outputPath);

        console.log(`Optimized ${file} -> ${outputFileName}`);
      } catch (err) {
        console.error(`Error processing ${file}:`, err);
      }
    }
  }

  const manifestJson = `${JSON.stringify(manifest, null, 2)}\n`;
  const manifestModule = `const imageManifest = ${JSON.stringify(manifest, null, 2)};\n\nexport default imageManifest;\n`;

  fs.writeFileSync(`${publicManifestPath}.tmp`, manifestJson);
  fs.renameSync(`${publicManifestPath}.tmp`, publicManifestPath);

  fs.writeFileSync(`${importableManifestPath}.tmp`, manifestJson);
  fs.renameSync(`${importableManifestPath}.tmp`, importableManifestPath);

  fs.writeFileSync(`${importableManifestModulePath}.tmp`, manifestModule);
  fs.renameSync(`${importableManifestModulePath}.tmp`, importableManifestModulePath);
}

processImages();
