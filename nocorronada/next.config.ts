import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Parent directory has its own lockfile (multi-project workspace) — pin the root.
  turbopack: {
    root: path.join(__dirname),
  },
  async redirects() {
    return [
      { source: "/eventos", destination: "/corridas", permanent: true },
    ];
  },
};

export default nextConfig;
