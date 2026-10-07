import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Projects uploaded at /admin are served from Vercel Blob.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  // The default knowledge base is read at runtime until one is saved from /admin.
  outputFileTracingIncludes: {
    "/api/chat": ["./content/knowledge-base.md"],
    "/admin/knowledge": ["./content/knowledge-base.md"],
  },
};

export default nextConfig;
