# Multi-Subdomain Deployment Guide

This guide explains how to deploy multiple npm projects as subdomains using Cloudflare Workers.

## Project Structure

```
davidholcer.com_cursored/
├── apps/
│   ├── main-portfolio/          # davidholcer.com
│   ├── example-app/             # example.davidholcer.com
│   ├── blog-app/                # blog.davidholcer.com
│   └── api-app/                 # api.davidholcer.com
├── packages/                    # Shared packages
├── package.json                 # Root workspace config
└── wrangler.toml               # Root deployment config
```

## Cloudflare Workers Setup

### 1. Domain Configuration

In your Cloudflare dashboard:
1. Go to your domain (davidholcer.com)
2. Add DNS records for each subdomain:
   - Type: CNAME
   - Name: example
   - Target: your-workers-subdomain.pages.dev

### 2. Worker Configuration

Each app needs its own `wrangler.toml`:

```toml
name = "example-app"
compatibility_date = "2024-09-24"
compatibility_flags = ["nodejs_compat"]

[env.production]
name = "example-app"
route = "example.davidholcer.com/*"
zone_id = "your-zone-id-here"
```

### 3. Deployment Commands

For each app:

```bash
# Navigate to app directory
cd apps/example-app

# Install dependencies
npm install

# Build the app
npm run build

# Deploy to Cloudflare
npm run deploy
```

## Available Deployment Options

### Option 1: Cloudflare Pages (Recommended)
- Automatic deployments from Git
- Built-in CI/CD
- Easy subdomain routing

### Option 2: Cloudflare Workers
- More control over routing
- Custom logic for subdomain handling
- Better for API-heavy applications

### Option 3: Cloudflare Workers Sites
- Static site hosting
- Good for simple apps

## Example Apps You Could Create

1. **blog.davidholcer.com** - Blog platform
2. **api.davidholcer.com** - API endpoints
3. **tools.davidholcer.com** - Utility tools
4. **docs.davidholcer.com** - Documentation
5. **demo.davidholcer.com** - Live demos
6. **admin.davidholcer.com** - Admin panel

## Development Workflow

1. Create new app in `apps/` directory
2. Set up package.json with unique port
3. Configure wrangler.toml for subdomain
4. Develop locally on different ports
5. Deploy to Cloudflare with custom domain

## Environment Variables

Each app can have its own environment variables:

```bash
# In each app's wrangler.toml
[vars]
API_KEY = "your-api-key"
DATABASE_URL = "your-database-url"
```

## Shared Packages

Create reusable packages in the `packages/` directory:

```bash
packages/
├── ui-components/
├── utils/
└── types/
```

These can be shared across all your subdomain apps.
