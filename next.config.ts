import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Projects uploaded at /admin are served from Vercel Blob.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  // The chat route reads content/knowledge-base.md at runtime.
  outputFileTracingIncludes: {
    "/api/chat": ["./content/knowledge-base.md"],
  },
};

export default nextConfig;
