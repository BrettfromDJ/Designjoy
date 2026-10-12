import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Projects uploaded at /admin are served from Vercel Blob.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
    // Next only allows quality 75 unless others are listed here; anything else
    // is quietly rounded to 75. The grid uses 90 and the lightbox 95.
    qualities: [75, 90, 95],
  },
  // The default knowledge base is read at runtime until one is saved from /admin.
  outputFileTracingIncludes: {
    "/api/chat": ["./content/knowledge-base.md"],
    "/admin/knowledge": ["./content/knowledge-base.md"],
    "/api/chat/questions": ["./content/knowledge-base.md"],
  },
};

export default nextConfig;
