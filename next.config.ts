import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The chat route reads content/knowledge-base.md at runtime.
  outputFileTracingIncludes: {
    "/api/chat": ["./content/knowledge-base.md"],
  },
};

export default nextConfig;
