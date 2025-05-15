#!/bin/bash

echo "🚀 Deploying Next.js Starburst99 App to Vercel"
echo "============================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Set environment variable
export DISABLE_QUEUE_MANAGER=true

# Deploy to Vercel
echo "📦 Building and deploying to Vercel..."
echo "Please log in if prompted:"

vercel --prod --yes \
  --env DISABLE_QUEUE_MANAGER=true \
  --name nextjs-starburst99-app \
  --public

echo "✅ Deployment complete!"
echo "Your app should be available at: https://nextjs-starburst99-app.vercel.app"