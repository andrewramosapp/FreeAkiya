import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    domains: [
      "images.unsplash.com",
      "cdn.prod.website-files.com",
      "via.placeholder.com",
    ],
  },
};

export default nextConfig;
