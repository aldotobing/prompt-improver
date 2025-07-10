/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: [],
  },
  output: 'export',
  // Disable source maps in production to reduce memory usage
  productionBrowserSourceMaps: false,
  // Disable static optimization for individual pages that might be causing issues
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    optimizePackageImports: ['@radix-ui/react-*']
  },
  // Enable React strict mode
  reactStrictMode: true,
  // Disable unnecessary features for static export
  poweredByHeader: false,
  generateEtags: false,
  compress: false,
};

export default nextConfig;
