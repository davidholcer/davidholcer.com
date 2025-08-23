/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use Cloudflare Pages with server-side rendering
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://example.davidholcer.com' : '',
  webpack: (config, { dev, isServer }) => {
    // Disable caching for production builds
    if (!dev && !isServer) {
      config.cache = false;
    }
    return config
  },
  experimental: {
    // Disable features that might cause large bundles
    optimizeCss: false,
    optimizePackageImports: false,
  },
}

module.exports = nextConfig
