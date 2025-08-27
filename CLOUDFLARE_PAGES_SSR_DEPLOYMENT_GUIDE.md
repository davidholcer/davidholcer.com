# Cloudflare Pages SSR Deployment Guide

This guide explains how to deploy the portfolio to Cloudflare Pages using server-side rendering (SSR) to support API routes.

## Why SSR Instead of Static Export?

The portfolio uses API routes (e.g., `/api/sketch/[filename]`) for dynamic P5.js sketch generation. These routes require server-side processing and don't work with static export.

## Updated Configuration

### 1. Next.js Configuration
The `apps/main-portfolio/next.config.js` has been updated:
```javascript
{
  // Removed: output: 'export'
  // Removed: distDir: 'out'
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}
```

### 2. Cloudflare Pages Settings

**Updated Build Configuration:**
- **Framework preset**: `Next.js`
- **Build command**: `cd apps/main-portfolio && npm install && npm run build`
- **Build output directory**: `apps/main-portfolio/.next` ← **Changed from `out`**
- **Root directory**: `/` (repository root)

## Cloudflare Pages Projects

### Main Portfolio (`davidholcer-com`)
- **Domain**: `davidholcer.com`
- **Build command**: `cd apps/main-portfolio && npm install && npm run build`
- **Output directory**: `apps/main-portfolio/.next` ← **Updated**
- **Node.js version**: `18.x` or `20.x`

### Example App (`example-app`)
- **Domain**: `example.davidholcer.com`
- **Build command**: `cd apps/example-app && npm install && npm run build`
- **Output directory**: `apps/example-app/out` (static export, no API routes)

## Key Differences: SSR vs Static Export

### Server-Side Rendering (Main Portfolio)
- ✅ **API routes work** (`/api/sketch/*`)
- ✅ **Dynamic content** generation
- ✅ **P5.js sketches** render correctly
- ✅ **Server functions** available
- 📁 **Output**: `.next` directory

### Static Export (Example App)
- ❌ **No API routes**
- ✅ **Faster loading**
- ✅ **Better caching**
- ✅ **Simpler deployment**
- 📁 **Output**: `out` directory

## Updating Cloudflare Pages

### Step 1: Update Main Portfolio Project
1. Go to Cloudflare Pages Dashboard
2. Select `davidholcer-com` project
3. Go to Settings → Builds & deployments
4. Update **Build output directory** to: `apps/main-portfolio/.next`
5. Ensure **Framework preset** is `Next.js` (not Static HTML Export)

### Step 2: Keep Example App As-Is
The example app continues to use static export since it doesn't need API routes.

## Environment Variables

For SSR deployment, you may need:
```
NODE_VERSION=18
NPM_VERSION=latest
```

## Build Process

### Main Portfolio (SSR)
1. `npm run build` generates `.next/` directory
2. Includes server functions for API routes
3. Supports dynamic rendering
4. P5.js sketches work via `/api/sketch/*`

### Example App (Static)
1. `npm run build` generates `out/` directory
2. Pure static HTML/CSS/JS
3. No server functions
4. Faster loading

## API Routes Support

With SSR, these API routes work:
- `/api/sketch/[filename]` - Dynamic P5.js sketch generation
- `/api/projects/` - Project data API
- `/api/blog/` - Blog data API

## Testing

### Local Development
```bash
npm run dev:main      # Test main portfolio with API routes
npm run dev:example   # Test example app (static)
```

### Production Testing
- Main Portfolio: `https://davidholcer.com/api/sketch/moving_points.js`
- Example App: `https://example.davidholcer.com` (no API routes)

## Troubleshooting

### API Routes 404
- Ensure you're using SSR (not static export)
- Check build output directory is `.next` not `out`
- Verify Framework preset is `Next.js`

### Build Failures
- Check Node.js version compatibility
- Ensure all dependencies are installed
- Monitor build logs in Cloudflare Pages

### Sketch Not Loading
- Check API route is accessible: `/api/sketch/[filename]`
- Verify P5.js files exist in `public/assets/sketches/`
- Check browser console for errors

## Benefits of This Setup

✅ **Hybrid Approach**: Main portfolio uses SSR for advanced features, example app uses static for simplicity
✅ **API Routes**: P5.js sketches work with dynamic generation
✅ **Performance**: Static example app loads fastest, main app has dynamic features
✅ **Scalability**: Can add more API routes to main portfolio as needed

## File Structure After Build

### Main Portfolio (.next/)
```
apps/main-portfolio/.next/
├── server/                 # Server functions (API routes)
├── static/                 # Static assets
├── standalone/             # Serverless functions
└── ...                     # Other Next.js files
```

### Example App (out/)
```
apps/example-app/out/
├── index.html             # Static HTML
├── _next/                 # Static assets
└── ...                    # Other static files
```

Both deployments work together seamlessly! 🎉

