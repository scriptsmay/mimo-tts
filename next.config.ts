import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.31.10"],
  experimental: {
    serverActions: {
      bodySizeLimit: "120mb",
    },
  },
};

export default nextConfig;
