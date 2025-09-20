# Production Performance Optimization Script for Windows
# Run this before deploying to production

Write-Host "🚀 Starting production optimization..." -ForegroundColor Green

# 1. Clear all caches
Write-Host "🧹 Clearing caches..." -ForegroundColor Yellow
if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }
if (Test-Path "node_modules\.cache") { Remove-Item -Recurse -Force "node_modules\.cache" }

# 2. Install dependencies with clean state
Write-Host "📦 Installing dependencies with clean state..." -ForegroundColor Yellow
npm ci --only=production

# 3. Build with optimization flags
Write-Host "🏗️ Building optimized production bundle..." -ForegroundColor Yellow
$env:NODE_ENV = "production"
npm run build

# 4. Test production build locally
Write-Host "🧪 Testing production build..." -ForegroundColor Yellow
$server = Start-Process -FilePath "npm" -ArgumentList "run", "start" -NoNewWindow -PassThru

# Wait for server to start
Start-Sleep -Seconds 10

# Test critical endpoints
Write-Host "🔍 Testing critical endpoints..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri "http://localhost:3000/api/auth/me" -Method HEAD -TimeoutSec 5
    Write-Host "✅ Auth endpoint working" -ForegroundColor Green
} catch {
    Write-Host "❌ Auth endpoint test failed" -ForegroundColor Red
}

try {
    Invoke-WebRequest -Uri "http://localhost:3000/api/warmup" -Method HEAD -TimeoutSec 5
    Write-Host "✅ Warmup endpoint working" -ForegroundColor Green
} catch {
    Write-Host "❌ Warmup endpoint test failed" -ForegroundColor Red
}

try {
    Invoke-WebRequest -Uri "http://localhost:3000/" -Method HEAD -TimeoutSec 5
    Write-Host "✅ Homepage working" -ForegroundColor Green
} catch {
    Write-Host "❌ Homepage test failed" -ForegroundColor Red
}

# Stop test server
Stop-Process -Id $server.Id -Force

Write-Host ""
Write-Host "✅ Production optimization complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Performance Tips:" -ForegroundColor Cyan
Write-Host "1. Make sure your hosting platform has caching enabled"
Write-Host "2. Use CDN for static assets"
Write-Host "3. Enable gzip compression"
Write-Host "4. Set proper cache headers"
Write-Host "5. Use HTTP/2 if available"
Write-Host ""
Write-Host "🚀 Ready for deployment!" -ForegroundColor Green

# Deployment checklist
Write-Host ""
Write-Host "📝 Pre-deployment checklist:" -ForegroundColor Magenta
Write-Host "□ Environment variables set correctly"
Write-Host "□ Database connection string updated"
Write-Host "□ API endpoints accessible"
Write-Host "□ Service worker registered"
Write-Host "□ Static assets optimized"
Write-Host "□ Bundle size under 1MB"