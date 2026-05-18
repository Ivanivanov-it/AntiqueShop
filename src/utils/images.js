import imageManifest from "../generated/image-manifest.js";

const stripOrigin = (url) => {
  try {
    return new URL(url).pathname;
  } catch {
    return url.split("?")[0].split("#")[0];
  }
};

const decodePath = (url) => {
  try {
    return decodeURI(url);
  } catch {
    return url;
  }
};

const getLegacyImageSet = (url) => {
  const clean = stripOrigin(url).split("/").pop();
  const base = clean.replace(/\.[^/.]+$/, "");

  return {
    small: `/images/optimized/${base}-400.webp`,
    medium: `/images/optimized/${base}-800.webp`,
    large: `/images/optimized/${base}-1200.webp`,
  };
};

export function getImageSet(url) {
  const path = stripOrigin(url);
  const decodedPath = decodePath(path);
  const manifestMatch = imageManifest[path] || imageManifest[decodedPath];

  if (manifestMatch) return manifestMatch;

  return getLegacyImageSet(path);
}
