/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    remotePatterns: [
      { protocol: 'https', hostname: '**.ashevillere.com' },
    ],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,

  // Vercel serverless optimization
  serverExternalPackages: [],

  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'recharts',
    ],
  },

  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
        { key: 'Link', value: '<https://ashevillere.com>; rel="canonical"' },
      ],
    },
    {
      source: '/_next/static/(.*)',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
    {
      source: '/og',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=86400, s-maxage=604800' },
        { key: 'CDN-Cache-Control', value: 'public, max-age=604800' },
      ],
    },
    {
      source: '/sitemap.xml',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=86400' },
      ],
    },
  ],

  async rewrites() {
    return [];
  },
};

module.exports = nextConfig;
