export function getImageSet(url) {
  const base = url.replace(/\.[^/.]+$/, "");

  return {
    small: `${base}-400.webp`,
    medium: `${base}-800.webp`,
    large: `${base}-1200.webp`,
  };
}