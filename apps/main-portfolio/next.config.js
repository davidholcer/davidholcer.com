/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use static export only for production builds (Cloudflare Pages)
  // In development, use SSR to enable API routes
  ...(process.env.NODE_ENV === 'production' ? { output: 'export' } : {}),
  trailingSlash: true,
  ...(process.env.NODE_ENV === 'production' ? { distDir: 'out' } : {}),
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
  },
}

module.exports = nextConfig 