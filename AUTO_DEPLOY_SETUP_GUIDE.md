# Auto-Deploy Setup Guide for Multiple Subdomains

This guide explains how to set up automatic deployment for both the main portfolio and example app to different subdomains.

## Project Structure
```
davidholcer.com_cursored/
├── apps/
│   ├── main-portfolio/     # Deploys to davidholcer.com
│   └── example-app/        # Deploys to example.davidholcer.com
└── scripts/                # Deployment scripts
```

## Cloudflare Pages Projects

You need to create **two separate** Cloudflare Pages projects:

### 1. Main Portfolio (`davidholcer-com`)
- **Domain**: `davidholcer.com`
- **Source**: GitHub repo `davidholcer/davidholcer.com`
- **Build settings**:
  - Framework preset: Next.js (Static HTML Export)
  - Build command: `cd apps/main-portfolio && npm install && npm run build`
  - Build output directory: `apps/main-portfolio/out`
  - Root directory: `/` (repository root)

### 2. Example App (`example-app`)
- **Domain**: `example.davidholcer.com`
- **Source**: Same GitHub repo `davidholcer/davidholcer.com`
- **Build settings**:
  - Framework preset: Next.js (Static HTML Export)
  - Build command: `cd apps/example-app && npm install && npm run build`
  - Build output directory: `apps/example-app/out`
  - Root directory: `/` (repository root)

## Step-by-Step Setup

### Step 1: Create Cloudflare Pages Projects

#### Main Portfolio:
1. Go to Cloudflare Dashboard > Pages
2. Click "Create a project"
3. Connect to Git > Select your repository
4. Project name: `davidholcer-com`
5. Production branch: `main`
6. Build settings:
   ```
   Framework preset: Next.js (Static HTML Export)
   Build command: cd apps/main-portfolio && npm install && npm run build
   Build output directory: apps/main-portfolio/out
   Root directory: (leave empty for repository root)
   ```

#### Example App:
1. Create another project in Cloudflare Pages
2. Connect to the same Git repository
3. Project name: `example-app`
4. Production branch: `main`
5. Build settings:
   ```
   Framework preset: Next.js (Static HTML Export)
   Build command: cd apps/example-app && npm install && npm run build
   Build output directory: apps/example-app/out
   Root directory: (leave empty for repository root)
   ```

### Step 2: Configure Custom Domains

#### Main Portfolio Domain:
1. Go to `davidholcer-com` project > Custom domains
2. Add custom domain: `davidholcer.com`
3. Add custom domain: `www.davidholcer.com` (redirect to main)

#### Example App Domain:
1. Go to `example-app` project > Custom domains
2. Add custom domain: `example.davidholcer.com`

### Step 3: DNS Configuration

In your Cloudflare DNS settings:
```
Type    Name                 Content
CNAME   davidholcer.com      davidholcer-com.pages.dev
CNAME   www                  davidholcer.com
CNAME   example              example-app.pages.dev
```

## Environment Variables

No special environment variables are required for static deployments.

## Build Configuration

Both apps use static export configuration:

### apps/main-portfolio/next.config.js
```javascript
{
  output: 'export',
  distDir: 'out',
  trailingSlash: true,
  images: { unoptimized: true }
}
```

### apps/example-app/next.config.js
```javascript
{
  output: 'export',
  distDir: 'out',
  trailingSlash: true,
  images: { unoptimized: true },
  assetPrefix: 'https://example.davidholcer.com'
}
```

## Deployment Process

### Automatic Deployment
1. Push changes to `main` branch
2. Both Cloudflare Pages projects detect the change
3. Each runs its respective build command
4. Apps deploy to their configured domains

### Manual Deployment
```bash
# Deploy main portfolio
cd apps/main-portfolio
npm run build
npm run deploy

# Deploy example app
cd apps/example-app
npm run build
npm run deploy

# Or deploy both at once
npm run deploy:all
```

## Build Commands Reference

```bash
# Root level commands
npm run dev:main          # Start main portfolio dev server
npm run dev:example       # Start example app dev server
npm run dev:all          # Start both dev servers
npm run build:all        # Build both apps
npm run deploy:main      # Deploy main portfolio
npm run deploy:example   # Deploy example app
npm run deploy:all       # Deploy both apps
```

## Monitoring Deployments

### Cloudflare Pages Dashboard
- Monitor build logs for each project
- View deployment history
- Check domain status
- Configure build settings

### Build Logs Location
- Main Portfolio: `davidholcer-com` project > Deployments
- Example App: `example-app` project > Deployments

## Troubleshooting

### Build Failures
1. Check build logs in Cloudflare Pages dashboard
2. Verify build commands are correct
3. Ensure `package.json` scripts work locally
4. Check Node.js version compatibility

### Domain Issues
1. Verify DNS settings in Cloudflare DNS
2. Check custom domain configuration
3. Ensure SSL certificates are active
4. Wait for DNS propagation (up to 24 hours)

### Different Content on Domains
Each project builds independently:
- Changes to `apps/main-portfolio/` only affect `davidholcer.com`
- Changes to `apps/example-app/` only affect `example.davidholcer.com`
- Both projects share the same git repository

## Benefits

✅ **Independent Deployments**: Each app can be deployed separately
✅ **Automatic Builds**: Git push triggers both deployments
✅ **Custom Domains**: Each app has its own domain
✅ **CDN Distribution**: Cloudflare's global CDN
✅ **SSL Certificates**: Automatic HTTPS
✅ **Build Isolation**: Build failures in one app don't affect the other

## File Structure After Deployment

### Main Portfolio (davidholcer.com)
```
apps/main-portfolio/out/
├── index.html              # Home page
├── about/index.html        # About page
├── works/                  # Project pages
├── blog/                   # Blog pages
└── _next/                  # Next.js assets
```

### Example App (example.davidholcer.com)
```
apps/example-app/out/
├── index.html              # Example app page
└── _next/                  # Next.js assets
```

Both deployments are completely independent and can be updated separately!
