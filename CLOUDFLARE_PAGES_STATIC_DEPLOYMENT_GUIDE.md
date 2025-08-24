# Cloudflare Pages Static Deployment Guide

This guide explains how to deploy the portfolio to Cloudflare Pages using static export.

## Configuration Changes Made

### 1. Next.js Configuration (Updated)
The `next.config.js` has been updated for static export:
```javascript
{
  output: 'export',        // Generate static files
  distDir: 'out',         // Output directory
  trailingSlash: true,    // Required for static hosting
  images: {
    unoptimized: true     // Required for static export
  }
}
```

### 2. Static Generation
Both dynamic routes already have `generateStaticParams()`:
- `/works/[slug]/page.tsx`
- `/blog/[slug]/page.tsx`

## Cloudflare Pages Settings

### Build Configuration
- **Framework preset**: None (or Next.js if available)
- **Build command**: `npm run build`
- **Build output directory**: `out`
- **Root directory**: `apps/main-portfolio`

### Environment Variables
No special environment variables required for static deployment.

## Deployment Process

### Automatic Deployment (Git Integration)
1. Cloudflare Pages automatically builds on push to main branch
2. Uses the build command: `npm run build`
3. Deploys the `out` directory contents

### Manual Deployment
```bash
# From apps/main-portfolio directory
npm run build
npm run deploy
```

## Build Process
1. `next build` generates static files in `out/` directory
2. All routes are pre-rendered at build time
3. API routes are not supported with static export
4. Dynamic content is generated at build time

## Troubleshooting

### Vercel Build Error
If you see "routes-manifest.json" error, it means Cloudflare is trying to use Vercel's build process. The static export configuration should prevent this.

### Missing Pages
Ensure all dynamic routes have `generateStaticParams()` function.

### Image Optimization
Images use `unoptimized: true` - they won't be optimized by Next.js but will work with static hosting.

### API Routes
API routes (`/api/*`) are not supported with static export. All data fetching happens at build time.

## File Structure After Build
```
out/
├── index.html              # Home page
├── about/
│   └── index.html         # About page
├── works/
│   ├── index.html         # Works listing
│   ├── deco/
│   │   └── index.html     # Individual work page
│   └── ...
├── blog/
│   ├── index.html         # Blog listing
│   └── ...
├── _next/                 # Next.js assets
└── assets/                # Static assets
```

## Custom Domain Setup
1. Go to Cloudflare Pages dashboard
2. Select your project
3. Go to "Custom domains"
4. Add `davidholcer.com`
5. Cloudflare will automatically configure DNS

## Benefits of Static Export
- ✅ Fast loading times
- ✅ Better SEO (pre-rendered)
- ✅ Works with any static hosting
- ✅ No server costs
- ✅ Automatic CDN distribution

## Limitations
- ❌ No server-side rendering
- ❌ No API routes
- ❌ No dynamic features requiring server
- ❌ Build-time data only
