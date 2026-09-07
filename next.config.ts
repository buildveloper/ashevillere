import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Canonical host is the apex (https://ashevillere.com) — every www request
  // 308s to it so there's never duplicate live content (matching the
  // http→https upgrade Vercel already performs).
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.ashevillere.com" }],
        destination: "https://ashevillere.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
