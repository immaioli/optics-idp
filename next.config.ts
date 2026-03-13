import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  // Enables standalone build mode for drastically smaller Docker images
  output: 'standalone',

  // Optional: Disable source maps in production for security and performance
  productionBrowserSourceMaps: false,
};

export default nextConfig;
