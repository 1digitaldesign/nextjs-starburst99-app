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

# Load environment variables from .env.local if it exists
if [ -f ".env.local" ]; then
    echo "📄 Loading environment variables from .env.local..."
    export $(cat .env.local | grep VERCEL_TOKEN | xargs)
fi

# Check if VERCEL_TOKEN is provided
if [ -z "$VERCEL_TOKEN" ]; then
    echo "⚠️  No VERCEL_TOKEN found. Please set it in .env.local or environment"
    echo "   You can get a token from: https://vercel.com/account/tokens"
    echo "   Then add it to .env.local: VERCEL_TOKEN=your_token_here"
    echo ""
    echo "Falling back to login mode..."
    vercel --prod --yes \
      --name nextjs-starburst99-app \
      --public
else
    echo "🔑 Using Vercel token for authentication..."
    vercel --prod --yes \
      --token "$VERCEL_TOKEN" \
      --env EDGE_CONFIG="$EDGE_CONFIG" \
      --name nextjs-starburst99-app \
      --public
fi

echo "✅ Deployment complete!"
echo "Your app should be available at: https://nextjs-starburst99-app.vercel.app"