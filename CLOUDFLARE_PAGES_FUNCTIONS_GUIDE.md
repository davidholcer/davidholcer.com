# Cloudflare Pages + Functions Deployment Guide

This guide explains the hybrid approach using **Cloudflare Pages** for static content and **Cloudflare Functions** for API routes.

## Why This Approach?

**Problem**: Cloudflare Pages doesn't support Next.js API routes in the standard way.

**Solution**: 
- **Static Export**: Fast, cached static site for main content
- **Cloudflare Functions**: Serverless functions for API routes (`/api/*`)

## Architecture

```
├── Static Site (Next.js Export)    → Cloudflare Pages
│   ├── pages (/, /works, /blog)
│   ├── components
│   └── assets
└── API Routes (Cloudflare Functions) → Cloudflare Workers
    ├── /api/sketch/[filename]
    ├── /api/projects
    └── /api/blog
```

## File Structure

```
apps/main-portfolio/
├── functions/                    # Cloudflare Functions
│   └── api/
│       ├── sketch/
│       │   └── [filename].ts    # Dynamic sketch API
│       ├── projects.ts          # Projects API
│       └── blog.ts             # Blog API
├── app/                         # Next.js App
│   ├── api/                    # Original API routes (dev only)
│   ├── components/
│   └── pages/
├── out/                        # Static build output
└── next.config.js              # Static export config
```

## Configuration

### 1. Next.js Configuration
```javascript
// apps/main-portfolio/next.config.js
{
  output: 'export',              // Generate static files
  distDir: 'out',               // Output to /out directory
  trailingSlash: true,          // Required for proper routing
  images: { unoptimized: true } // Required for static export
}
```

### 2. Cloudflare Pages Settings
- **Build command**: `cd apps/main-portfolio && npm install && npm run build`
- **Build output directory**: `apps/main-portfolio/out`
- **Functions directory**: `apps/main-portfolio/functions` (auto-detected)

## API Routes Implementation

### Sketch API (`/api/sketch/[filename]`)
**File**: `functions/api/sketch/[filename].ts`

**Features**:
- Dynamic P5.js sketch modification
- Theme support (light/dark)
- Dimension customization
- Proper CORS headers

**Example**: `/api/sketch/moving_points.js?theme=dark&sketchWidth=1920&sketchHeight=1080`

### Projects API (`/api/projects`)
**File**: `functions/api/projects.ts`

**Features**:
- Static project data
- JSON response format
- Caching headers

### Blog API (`/api/blog`)
**File**: `functions/api/blog.ts`

**Features**:
- Static blog post data
- JSON response format
- Caching headers

## How It Works

### 1. Static Content (Pages)
```
User Request → Cloudflare Pages → Static HTML/CSS/JS
```
- Ultra-fast loading
- Global CDN distribution
- Perfect SEO

### 2. API Requests (Functions)
```
User Request → Cloudflare Functions → Dynamic Response
```
- Serverless execution
- Zero cold start
- Global edge computing

### 3. P5.js Sketches
```
Browser → /api/sketch/filename.js → Modified P5.js Code → Canvas Rendering
```

## Development vs Production

### Local Development
```bash
npm run dev
```
- Uses Next.js API routes (`app/api/*`)
- Hot reloading
- Full debugging

### Production (Cloudflare)
```bash
npm run build
```
- Static files in `/out`
- Functions in `/functions`
- Global deployment

## Deployment Process

### Automatic Deployment
1. **Push to Git** → Triggers Cloudflare Pages build
2. **Build Static Site** → Generates `/out` directory
3. **Deploy Functions** → Deploys `/functions` directory
4. **Route Traffic** → Pages serve static content, Functions handle `/api/*`

### Manual Testing
```bash
# Build locally
npm run build

# Check output
ls out/          # Static files
ls functions/    # Function files
```

## Cloudflare Pages Dashboard Setup

### Build Settings
- **Framework**: `Next.js (Static HTML Export)`
- **Build command**: `cd apps/main-portfolio && npm install && npm run build`
- **Build output directory**: `apps/main-portfolio/out`
- **Functions directory**: `apps/main-portfolio/functions` (auto-detected)

### Environment Variables
- `NODE_VERSION=18`
- `NPM_VERSION=latest`

## Benefits

### Static Content
✅ **Lightning Fast**: Pre-rendered HTML
✅ **SEO Optimized**: Perfect for search engines
✅ **Global CDN**: Cached worldwide
✅ **Zero Downtime**: No server dependencies

### API Functions
✅ **Serverless**: No infrastructure management
✅ **Global Edge**: Executes close to users
✅ **Auto-scaling**: Handles any traffic load
✅ **Zero Cold Start**: Cloudflare Workers are instant

### Combined Benefits
✅ **Best of Both**: Static speed + Dynamic functionality
✅ **Cost Effective**: Pay only for function execution
✅ **Highly Available**: Distributed across Cloudflare's network
✅ **Easy Deployment**: Single git push deploys everything

## API Endpoints

### Production URLs
- **Sketch API**: `https://davidholcer.com/api/sketch/moving_points.js`
- **Projects API**: `https://davidholcer.com/api/projects`
- **Blog API**: `https://davidholcer.com/api/blog`

### Local URLs (Dev)
- **Sketch API**: `http://localhost:3000/api/sketch/moving_points.js`
- **Projects API**: `http://localhost:3000/api/projects`
- **Blog API**: `http://localhost:3000/api/blog`

## Troubleshooting

### Functions Not Working
1. Check `/functions` directory exists in build output
2. Verify function syntax (Cloudflare Workers format)
3. Check Cloudflare Pages logs

### API 404 Errors
1. Ensure functions are deployed: Check Pages → Functions tab
2. Verify function file naming: `[filename].ts` for dynamic routes
3. Check function exports: `onRequestGet`, `onRequestOptions`

### CORS Issues
- All functions include proper CORS headers
- Preflight requests handled with `onRequestOptions`

This hybrid approach gives you the best of both worlds: lightning-fast static site performance with powerful serverless API capabilities! 🚀

