import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["@prisma/client"],
  },
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },
};

export default nextConfig;
