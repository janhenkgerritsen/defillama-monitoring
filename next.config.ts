import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  reactStrictMode: true,
  devIndicators: {
    position: "bottom-right",
  },
};

export default nextConfig;
