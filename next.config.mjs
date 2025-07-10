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
  
  // Disable source maps to reduce memory usage
  productionBrowserSourceMaps: false,
  
  // Disable TypeScript type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable React Strict Mode during build
  reactStrictMode: false,
  
  // Disable unnecessary features
  poweredByHeader: false,
  generateEtags: false,
  compress: false,
  
  // Disable image optimization
  images: {
    unoptimized: true,
  },
  
  // Disable webpack optimizations that use too much memory
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = false;
      config.optimization.minimize = false;
    }
    
    // Exclude large dependencies from being processed
    config.resolve.alias = {
      ...config.resolve.alias,
      'framer-motion': require.resolve('framer-motion/dist/framer-motion'),
    };
    
    return config;
  },
  
  // Disable static optimization
  experimental: {
    optimizeCss: false,  // Disable CSS optimization
    scrollRestoration: false,
    optimizePackageImports: ['@radix-ui/react-*'],
  },
};

export default nextConfig;
