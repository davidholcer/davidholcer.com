#!/bin/bash

# Build and deploy script optimized for Cloudflare Pages
echo "🧹 Cleaning up cache and build artifacts..."

# Function to build and deploy an app
build_and_deploy() {
    local app_name=$1
    local app_dir=$2
    
    echo "📦 Building $app_name..."
    cd "$app_dir"
    
    # Clean up cache and build artifacts
    rm -rf .next node_modules/.cache
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing dependencies for $app_name..."
        npm install
    fi
    
    # Build the app
    echo "🔨 Building $app_name..."
    npm run build
    
        # Check if build was successful
    if [ -d ".next" ]; then
      echo "✅ Build successful for $app_name"
        
        # Deploy to Cloudflare Pages
        echo "🚀 Deploying $app_name to Cloudflare Pages..."
        npm run deploy
        
        echo "✅ $app_name deployed successfully!"
    else
        echo "❌ Build failed for $app_name"
        exit 1
    fi
    
    cd - > /dev/null
}

# Build and deploy main portfolio
build_and_deploy "main-portfolio" "apps/main-portfolio"

# Build and deploy example app
build_and_deploy "example-app" "apps/example-app"

echo ""
echo "🎉 All apps built and deployed successfully!"
echo ""
echo "🌐 Check your deployments:"
echo "   - Main Portfolio: https://davidholcer.com"
echo "   - Example App: https://example.davidholcer.com"
echo ""
echo "📝 Don't forget to set up custom domains in Cloudflare Dashboard"
