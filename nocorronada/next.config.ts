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
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Force HTTPS for two years, subdomains included.
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          // Never sniff content types.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // The site never needs to be embedded in someone else's frame.
          { key: "X-Frame-Options", value: "DENY" },
          // Send only the origin as referrer to external sites.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // We don't use these browser APIs; lock them off.
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
