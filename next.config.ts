import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile ESM-only packages for Next.js serverless compatibility
  transpilePackages: ['google-spreadsheet', 'google-auth-library'],
};

export default nextConfig;
