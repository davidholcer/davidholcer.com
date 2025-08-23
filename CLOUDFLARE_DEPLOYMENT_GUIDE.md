# Cloudflare Pages Deployment Guide

This guide will help you deploy your multi-app setup to Cloudflare Pages with subdomains.

## Current Setup

- **Main Portfolio**: `davidholcer.com` (using existing `davidholcer-com` project)
- **Example App**: `example.davidholcer.com` (new `example-app` project)

## Step 1: Deploy Main Portfolio

The main portfolio is already connected to `davidholcer.com` through the existing `davidholcer-com` project.

```bash
# Navigate to main portfolio
cd apps/main-portfolio

# Build the app
npm run build

# Deploy to Cloudflare Pages
npm run deploy
```

## Step 2: Deploy Example App

```bash
# Navigate to example app
cd apps/example-app

# Build the app
npm run build

# Deploy to Cloudflare Pages
npm run deploy
```

## Step 3: Set up Custom Domains

### For Main Portfolio (davidholcer.com)
1. Go to Cloudflare Dashboard
2. Navigate to Pages → davidholcer-com
3. Go to Custom Domains tab
4. Add custom domain: `davidholcer.com`
5. Update DNS records if needed

### For Example App (example.davidholcer.com)
1. Go to Cloudflare Dashboard
2. Navigate to Pages → example-app
3. Go to Custom Domains tab
4. Add custom domain: `example.davidholcer.com`
5. Add DNS record in your domain:
   - Type: CNAME
   - Name: example
   - Target: example-app-9ox.pages.dev

## Step 4: Automatic Deployment (Optional)

To enable automatic deployments on git push:

### For Main Portfolio
1. In Cloudflare Dashboard → Pages → davidholcer-com
2. Go to Settings → Git
3. Connect your GitHub repository
4. Set build settings:
   - Framework preset: Next.js
   - Build command: `cd apps/main-portfolio && npm run build`
   - Build output directory: `apps/main-portfolio/out`
   - Root directory: `/`

### For Example App
1. In Cloudflare Dashboard → Pages → example-app
2. Go to Settings → Git
3. Connect your GitHub repository
4. Set build settings:
   - Framework preset: Next.js
   - Build command: `cd apps/example-app && npm run build`
   - Build output directory: `apps/example-app/out`
   - Root directory: `/`

## Step 5: Environment Variables

If you need environment variables:

1. Go to your Pages project
2. Settings → Environment variables
3. Add any required variables for each environment (Production/Preview)

## Troubleshooting

### Build Issues
- Make sure all dependencies are installed
- Check that `output: 'export'` is in next.config.js
- Verify TypeScript compilation

### Domain Issues
- Ensure DNS records are properly configured
- Check that custom domains are added in Pages settings
- Verify SSL certificates are active

### API Routes
- API routes won't work with static export
- Consider using Cloudflare Workers for API functionality
- Or use external API services

## Manual Deployment Commands

```bash
# Deploy main portfolio
cd apps/main-portfolio
npm run build
wrangler pages deploy out --project-name davidholcer-com

# Deploy example app
cd apps/example-app
npm run build
wrangler pages deploy out --project-name example-app
```

## Verification

After deployment, verify:
1. Main portfolio: https://davidholcer.com
2. Example app: https://example.davidholcer.com
3. Both apps load correctly
4. All assets and images load
5. Navigation works properly

## Next Steps

1. Set up automatic deployments
2. Configure environment variables if needed
3. Set up monitoring and analytics
4. Consider adding more subdomain apps as needed
