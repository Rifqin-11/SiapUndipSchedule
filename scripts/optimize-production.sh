#!/bin/bash

# Production Performance Optimization Script
# Run this before deploying to production

echo "🚀 Starting production optimization..."

# 1. Clear all caches
echo "🧹 Clearing caches..."
rm -rf .next
rm -rf node_modules/.cache

# 2. Install dependencies with clean state
echo "📦 Installing dependencies with clean state..."
npm ci --only=production

# 3. Build with optimization flags
echo "🏗️ Building optimized production bundle..."
NODE_ENV=production npm run build

# 4. Analyze bundle size (optional)
echo "📊 Analyzing bundle size..."
if command -v npx &> /dev/null; then
    npx @next/bundle-analyzer
fi

# 5. Run production test
echo "🧪 Testing production build..."
npm run start &
SERVER_PID=$!

# Wait for server to start
sleep 10

# Test critical endpoints
echo "🔍 Testing critical endpoints..."
curl -I http://localhost:3000/api/auth/me || echo "❌ Auth endpoint test failed"
curl -I http://localhost:3000/api/warmup || echo "❌ Warmup endpoint test failed"
curl -I http://localhost:3000/ || echo "❌ Homepage test failed"

# Stop test server
kill $SERVER_PID

echo "✅ Production optimization complete!"
echo ""
echo "📋 Performance Tips:"
echo "1. Make sure your hosting platform has caching enabled"
echo "2. Use CDN for static assets"
echo "3. Enable gzip compression"
echo "4. Set proper cache headers"
echo "5. Use HTTP/2 if available"
echo ""
echo "🚀 Ready for deployment!"
