#!/bin/bash

# Development script to run all apps simultaneously
echo "🚀 Starting development servers for all apps..."

# Function to start an app in the background
start_app() {
    local app_name=$1
    local port=$2
    local app_dir=$3
    
    echo "📦 Starting $app_name on port $port..."
    cd "$app_dir"
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing dependencies for $app_name..."
        npm install
    fi
    
    # Start the development server in the background
    npm run dev &
    local pid=$!
    echo "✅ $app_name started with PID: $pid"
    
    # Store the PID for later cleanup
    echo $pid > "/tmp/$app_name.pid"
    
    cd - > /dev/null
}

# Create a cleanup function
cleanup() {
    echo ""
    echo "🛑 Shutting down all development servers..."
    
    # Kill all background processes
    for pid_file in /tmp/*.pid; do
        if [ -f "$pid_file" ]; then
            pid=$(cat "$pid_file")
            echo "🛑 Killing process $pid"
            kill $pid 2>/dev/null
            rm "$pid_file"
        fi
    done
    
    echo "✅ All servers stopped"
    exit 0
}

# Set up signal handlers for cleanup
trap cleanup SIGINT SIGTERM

# Start main portfolio on port 3000
start_app "main-portfolio" "3000" "apps/main-portfolio"

# Start example app on port 3001
start_app "example-app" "3001" "apps/example-app"

echo ""
echo "🌐 Development servers are running:"
echo "   - Main Portfolio: http://localhost:3000"
echo "   - Example App: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user to stop
wait
