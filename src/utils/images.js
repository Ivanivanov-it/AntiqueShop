export function getImageSet(url) {
  const clean = url.split("/").pop(); 
  const base = clean.replace(/\.[^/.]+$/, "");

  return {
    small: `/images/optimized/${base}-400.webp`,
    medium: `/images/optimized/${base}-800.webp`,
    large: `/images/optimized/${base}-1200.webp`,
  };
}