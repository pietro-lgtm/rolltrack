import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Parent directory has its own lockfile (multi-project workspace) — pin the root.
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    // Admin-uploaded art is served via /api/img?p=<blob-path>. The route only
    // serves the uploads/ prefix, so allowing its query string here is safe.
    localPatterns: [{ pathname: "/api/img" }, { pathname: "/**", search: "" }],
  },
  async redirects() {
    return [
      { source: "/eventos", destination: "/corridas", permanent: true },
    ];
  },
};

export default nextConfig;
