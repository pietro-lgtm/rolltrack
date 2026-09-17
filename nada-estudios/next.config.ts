import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Parent directory has its own lockfile (multi-project workspace) — pin the root.
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    // Admin-uploaded media is served via /api/img?p=<blob-path>. The route only
    // serves the uploads/ prefix, so allowing its query string here is safe.
    localPatterns: [{ pathname: "/api/img" }, { pathname: "/**", search: "" }],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
