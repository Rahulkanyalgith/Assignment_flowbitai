# Quick Deployment Script for apps/api
# Run this script to deploy to Vercel

Write-Host "🚀 Deploying apps/api to Vercel..." -ForegroundColor Cyan
Write-Host ""

# Navigate to API directory
Set-Location "c:\Users\acer\Desktop\assignment 2\apps\api"

# Step 1: Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Step 2: Build TypeScript
Write-Host "🔨 Building TypeScript..." -ForegroundColor Yellow
npm run build

# Step 3: Generate Prisma Client
Write-Host "🗄️  Generating Prisma Client..." -ForegroundColor Yellow
npm run db:generate

# Step 4: Check if Vercel CLI is installed
Write-Host "🔍 Checking Vercel CLI..." -ForegroundColor Yellow
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Red
    npm install -g vercel
}

# Step 5: Deploy
Write-Host ""
Write-Host "✨ Deploying to Vercel..." -ForegroundColor Green
Write-Host "You'll need to:" -ForegroundColor Yellow
Write-Host "  1. Login to Vercel (browser will open)" -ForegroundColor White
Write-Host "  2. Select your project settings" -ForegroundColor White
Write-Host "  3. Add environment variables after deployment" -ForegroundColor White
Write-Host ""

# Ask user if they want to continue
$continue = Read-Host "Continue with deployment? (y/n)"

if ($continue -eq "y") {
    vercel --prod
    
    Write-Host ""
    Write-Host "✅ Deployment initiated!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Go to your Vercel dashboard" -ForegroundColor White
    Write-Host "  2. Add environment variables:" -ForegroundColor White
    Write-Host "     - DATABASE_URL" -ForegroundColor Gray
    Write-Host "     - CORS_ORIGIN" -ForegroundColor Gray
    Write-Host "     - VANNA_API_BASE_URL (optional)" -ForegroundColor Gray
    Write-Host "  3. Redeploy if needed" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "❌ Deployment cancelled" -ForegroundColor Red
}
