/**
 * Formats an image URL to ensure it's valid for Next.js Image component
 * @param url The input URL to format
 * @param defaultImage Optional default image to use if URL is empty
 * @returns Formatted URL string
 */
export const formatImageUrl = (url: string | undefined | null, defaultImage: string = '/placeholder.jpg'): string => {
  if (!url) return defaultImage;
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return `https://img.phimapi.com${url}`;
  return `https://img.phimapi.com/${url}`;
}; 