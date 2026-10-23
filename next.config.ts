import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  reactStrictMode: true,
  // English and Bangla each have their own root layout, so the 404 page
  // renders its own <html> (app/global-not-found.tsx).
  experimental: { globalNotFound: true },
  images: {
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com" }],
  },
};

export default nextConfig;
