import fs from "fs";
import path from "path";
import sharp from "sharp";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const legacyUploadDir = path.join(__dirname, "../public/images/uploads");
const cmsUploadDir = path.join(__dirname, "../public/images/cms-uploads");
const contentDir = path.join(__dirname, "../src/content/antiques");

const inputDirs = [
  {
    dir: legacyUploadDir,
    publicPath: "/images/uploads",
  },
  {
    dir: cmsUploadDir,
    publicPath: "/images/cms-uploads",
  },
];
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
const FILE_STABLE_MS = 1200;
const FILE_STABLE_POLL_MS = 200;
const WRITE_RETRY_DELAY_MS = 150;
const WRITE_RETRIES = 12;

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

if (!fs.existsSync(generatedDir)) {
  fs.mkdirSync(generatedDir, { recursive: true });
}

for (const { dir } of inputDirs) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
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

function replaceAll(value, search, replacement) {
  return value.split(search).join(replacement);
}

function getUniqueDestination(file, inputPath) {
  const targetPath = path.join(legacyUploadDir, file);
  if (!fs.existsSync(targetPath)) {
    return { file, path: targetPath };
  }

  const parsed = path.parse(file);
  const hash = getContentHash(inputPath);
  const uniqueFile = `${parsed.name}-${hash}${parsed.ext}`;
  return {
    file: uniqueFile,
    path: path.join(legacyUploadDir, uniqueFile),
  };
}

async function archiveCmsUploads() {
  if (!fs.existsSync(cmsUploadDir)) return;

  const files = fs.readdirSync(cmsUploadDir).filter(isImage);
  if (files.length === 0) return;

  const markdownFiles = fs
    .readdirSync(contentDir)
    .filter((file) => /\.(md|mdx)$/i.test(file))
    .map((file) => path.join(contentDir, file));

  for (const file of files) {
    const inputPath = path.join(cmsUploadDir, file);
    await waitForStableFile(inputPath);

    const destination = getUniqueDestination(file, inputPath);
    const fromUrl = `/images/cms-uploads/${file}`;
    const toUrl = `/images/uploads/${destination.file}`;

    for (const markdownPath of markdownFiles) {
      const current = fs.readFileSync(markdownPath, "utf8");
      if (!current.includes(fromUrl)) continue;

      const next = replaceAll(current, fromUrl, toUrl);
      fs.writeFileSync(markdownPath, next);
    }

    fs.renameSync(inputPath, destination.path);
    console.log(`Archived CMS upload ${file} -> ${destination.file}`);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForStableFile(filePath) {
  let previous;
  let stableFor = 0;

  while (stableFor < FILE_STABLE_MS) {
    const current = fs.statSync(filePath);
    const signature = `${current.size}:${current.mtimeMs}`;

    if (signature === previous) {
      stableFor += FILE_STABLE_POLL_MS;
    } else {
      previous = signature;
      stableFor = 0;
    }

    await sleep(FILE_STABLE_POLL_MS);
  }
}

async function writeIfChanged(filePath, content) {
  if (fs.existsSync(filePath) && fs.readFileSync(filePath, "utf8") === content) {
    return;
  }

  const tmpPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmpPath, content);

  for (let attempt = 0; attempt <= WRITE_RETRIES; attempt += 1) {
    try {
      fs.renameSync(tmpPath, filePath);
      return;
    } catch (err) {
      if (!["EPERM", "EACCES", "EBUSY"].includes(err.code) || attempt === WRITE_RETRIES) {
        try {
          fs.unlinkSync(tmpPath);
        } catch {}
        throw err;
      }

      await sleep(WRITE_RETRY_DELAY_MS);
    }
  }
}

async function processImages() {
  await archiveCmsUploads();

  const manifest = {};

  for (const { dir, publicPath } of inputDirs) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      if (!isImage(file)) continue;

      const inputPath = path.join(dir, file);
      await waitForStableFile(inputPath);

      const baseName = getBaseName(file, inputPath);
      const uploadUrl = `${publicPath}/${file}`;
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
  }

  const manifestJson = `${JSON.stringify(manifest, null, 2)}\n`;
  const manifestModule = `const imageManifest = ${JSON.stringify(manifest, null, 2)};\n\nexport default imageManifest;\n`;

  await writeIfChanged(publicManifestPath, manifestJson);
  await writeIfChanged(importableManifestPath, manifestJson);
  await writeIfChanged(importableManifestModulePath, manifestModule);
}

processImages();
