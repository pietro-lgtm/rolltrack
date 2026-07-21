import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Parent directory has its own lockfile (multi-project workspace) — pin the root.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
