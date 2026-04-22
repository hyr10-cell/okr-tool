import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["@prisma/client"],
  },
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },
  allowedDevOrigins: ["172.19.100.30"],
};

export default nextConfig;
