/** @type {import('next').NextConfig} */
const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
];

const nextConfig = {
  // Serve CMS-managed WebP media from the FastAPI origin without exposing private API routes.
  async rewrites() {
    const origin = process.env.YUMMY_API_ORIGIN?.replace(/\/$/, "");
    return origin ? [{ source: "/media/:path*", destination: origin + "/media/:path*" }] : [];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;