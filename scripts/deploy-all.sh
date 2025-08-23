#!/bin/bash

# Deploy all apps in the workspace
echo "🚀 Deploying all apps..."

# Deploy main portfolio
echo "📦 Deploying main portfolio..."
cd apps/main-portfolio
npm run build
npm run deploy
cd ../..

# Deploy example app
echo "📦 Deploying example app..."
cd apps/example-app
npm run build
npm run deploy
cd ../..

echo "✅ All apps deployed successfully!"
echo ""
echo "🌐 Available subdomains:"
echo "   - davidholcer.com (main portfolio)"
echo "   - example.davidholcer.com (example app)"
echo ""
echo "📝 Check DEPLOYMENT_GUIDE.md for more details"
