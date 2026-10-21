import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Projects uploaded at /admin are served from Vercel Blob.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
    // Next only allows quality 75 unless others are listed here; anything else
    // is quietly rounded to 75. The grid uses 90 and the lightbox 95.
    qualities: [75, 90, 95],
    // Resized images are kept for a month. An upload never changes in place
    // (each gets a new URL), so there's nothing to go stale.
    minimumCacheTTL: 60 * 60 * 24 * 31,
  },
  // The site's own artwork, icons and logos: browsers keep them for a week
  // (and use a stale copy while checking for a new one), rather than asking
  // again on every visit.
  async headers() {
    return ["/work/:path*", "/icons/:path*", "/demo/:path*"].map((source) => ({
      source,
      headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
    }));
  },
  // The default knowledge base is read at runtime until one is saved from /admin.
  outputFileTracingIncludes: {
    "/api/chat": ["./content/knowledge-base.md"],
    "/admin/knowledge": ["./content/knowledge-base.md"],
    "/api/chat/questions": ["./content/knowledge-base.md"],
  },
};

export default nextConfig;
