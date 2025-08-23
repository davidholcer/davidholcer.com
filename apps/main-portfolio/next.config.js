/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use Cloudflare Pages with server-side rendering
  trailingSlash: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    domains: ['localhost'],
    unoptimized: true,
  },
  webpack: (config, { dev, isServer }) => {
    // Disable caching for production builds
    if (!dev && !isServer) {
      config.cache = false;
    }
    
    config.module.rules.push({
      test: /\.md$/,
      use: 'raw-loader',
    })
    
    return config
  },
  experimental: {
    // Disable features that might cause large bundles
    optimizeCss: false,
    optimizePackageImports: false,
  },
}

module.exports = nextConfig 