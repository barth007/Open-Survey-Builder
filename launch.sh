
#!/bin/bash

# Survey Application Launch Script
# This script sets up the environment and starts the development server

set -e  # Exit on any error

echo "🚀 Starting Survey Application..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    if [ -f ".env.example" ]; then
        echo "⚠️  .env.local not found. Copying from .env.example..."
        cp .env.example .env.local
        echo "📝 Please edit .env.local with your Supabase credentials before continuing."
        echo "   You can find your credentials at: https://supabase.com/dashboard"
        read -p "Press Enter to continue after setting up your environment variables..."
    else
        echo "❌ Neither .env.local nor .env.example found. Please create .env.local with your Supabase credentials."
        exit 1
    fi
fi

echo "✅ Environment file found"

# Install dependencies
echo "📦 Installing dependencies..."
if [ -f "package-lock.json" ]; then
    npm ci
else
    npm install
fi

echo "✅ Dependencies installed"

# Check if build works
echo "🔨 Verifying build configuration..."
npm run build > /dev/null 2>&1 || {
    echo "❌ Build failed. Please check your configuration."
    echo "   Running build with full output for debugging:"
    npm run build
    exit 1
}

echo "✅ Build verification successful"

# Start development server
echo "🌟 Starting development server..."
echo "📱 The application will be available at: http://localhost:8080"
echo "🔧 Press Ctrl+C to stop the server"
echo ""

# Start the dev server
npm run dev
