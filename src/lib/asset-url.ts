// Rewrites relative Lovable CDN asset URLs to absolute URLs so they load
// from any host (Vercel, custom domain, etc.), not just the Lovable preview.
const CDN_BASE = "https://c9504ae9-29a3-44f1-bc70-2d7feedd3640.lovableproject.com";

export function assetUrl(input: string | { url: string }): string {
  const url = typeof input === "string" ? input : input.url;
  if (url.startsWith("/__l5e/")) return CDN_BASE + url;
  return url;
}