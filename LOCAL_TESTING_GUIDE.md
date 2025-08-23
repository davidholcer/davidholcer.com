# Local Testing Guide

This guide shows you how to test both the main-portfolio and example-app locally.

## Quick Start (Recommended)

Run both apps simultaneously:

```bash
./scripts/dev-all.sh
```

This will:
- Start main-portfolio on http://localhost:3000
- Start example-app on http://localhost:3001
- Install dependencies automatically
- Handle cleanup when you press Ctrl+C

## Manual Testing

### Option 1: Test Apps Individually

**Main Portfolio (Port 3000):**
```bash
cd apps/main-portfolio
npm install
npm run dev
# Visit: http://localhost:3000
```

**Example App (Port 3001):**
```bash
cd apps/example-app
npm install
npm run dev
# Visit: http://localhost:3001
```

### Option 2: Test Both Simultaneously (Manual)

Open two terminal windows:

**Terminal 1:**
```bash
cd apps/main-portfolio
npm install
npm run dev
```

**Terminal 2:**
```bash
cd apps/example-app
npm install
npm run dev
```

## What You Should See

### Main Portfolio (localhost:3000)
- Your existing portfolio website
- All your current pages and components
- Works, blog, about, etc.

### Example App (localhost:3001)
- A simple gradient page
- "Example App" title
- "This is running on example.davidholcer.com"
- "Powered by Cloudflare Workers"

## Troubleshooting

### Port Already in Use
If you get "port already in use" errors:

1. Find the process using the port:
   ```bash
   lsof -i :3000  # for main portfolio
   lsof -i :3001  # for example app
   ```

2. Kill the process:
   ```bash
   kill -9 <PID>
   ```

### Dependencies Issues
If you get module not found errors:

1. Clear node_modules and reinstall:
   ```bash
   cd apps/main-portfolio
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Do the same for example-app if needed:
   ```bash
   cd apps/example-app
   rm -rf node_modules package-lock.json
   npm install
   ```

### TypeScript Errors
If you get TypeScript errors:

1. Make sure tsconfig.json exists in each app
2. Run `npm run build` to check for compilation errors
3. Check that all dependencies are properly installed

## Development Workflow

1. **Start development**: `./scripts/dev-all.sh`
2. **Make changes** to either app
3. **See changes** automatically in the browser
4. **Stop servers**: Press Ctrl+C
5. **Deploy**: Use `./scripts/deploy-all.sh` when ready

## Testing Different Scenarios

### Test Main Portfolio Features
- Navigate through all pages
- Test responsive design
- Check all interactive elements
- Verify blog posts load correctly

### Test Example App Features
- Verify the gradient background
- Check responsive design
- Test any interactive elements you add

### Test Cross-App Integration
- Verify both apps run simultaneously
- Check that ports don't conflict
- Test that stopping one doesn't affect the other
