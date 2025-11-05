# WorkHQ Frontend Setup and Start Script
# Run this script in PowerShell from the front directory

Write-Host "🚀 WorkHQ Frontend Setup & Start Script" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-Not (Test-Path ".env")) {
    Write-Host "❌ ERROR: .env file not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please create a .env file with the following content:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co" -ForegroundColor White
    Write-Host "EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here" -ForegroundColor White
    Write-Host "EXPO_PUBLIC_BACKEND_API_URL=http://192.168.0.185:3000" -ForegroundColor White
    Write-Host ""
    Write-Host "Get your Supabase credentials from:" -ForegroundColor Yellow
    Write-Host "https://supabase.com/dashboard → Your Project → Settings → API" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

Write-Host "✅ Found .env file" -ForegroundColor Green

# Check if node_modules exists
if (-Not (Test-Path "node_modules")) {
    Write-Host "📦 node_modules not found. Installing dependencies..." -ForegroundColor Yellow
    Write-Host ""
    
    # Clean install
    npm cache clean --force
    npm install --legacy-peer-deps
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ npm install failed!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "✅ node_modules found" -ForegroundColor Green
}

Write-Host ""
Write-Host "🧹 Clearing caches..." -ForegroundColor Yellow

# Clear Expo and Metro caches
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force $env:TEMP\metro-* -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force $env:TEMP\haste-* -ErrorAction SilentlyContinue

Write-Host "✅ Caches cleared" -ForegroundColor Green
Write-Host ""

# Get local IP for reference
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -like "*Wi-Fi*" -or $_.InterfaceAlias -like "*Ethernet*" } | Select-Object -First 1).IPAddress

Write-Host "📱 Your local IP address: $ipAddress" -ForegroundColor Cyan
Write-Host "   Make sure this matches your EXPO_PUBLIC_BACKEND_API_URL in .env" -ForegroundColor Gray
Write-Host ""

Write-Host "🚀 Starting Expo..." -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Instructions:" -ForegroundColor Yellow
Write-Host "  1. Wait for QR code to appear" -ForegroundColor White
Write-Host "  2. Open Expo Go app on your phone" -ForegroundColor White
Write-Host "  3. Scan the QR code" -ForegroundColor White
Write-Host ""
Write-Host "💡 If scanning doesn't work:" -ForegroundColor Yellow
Write-Host "  - Open Expo Go → Enter URL manually" -ForegroundColor White
Write-Host "  - Type: exp://${ipAddress}:8081" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 If same network doesn't work, press 't' for tunnel mode" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop at any time" -ForegroundColor Gray
Write-Host ""
Write-Host "Starting in 3 seconds..." -ForegroundColor Gray
Start-Sleep -Seconds 3

# Start Expo with clear cache
npx expo start --clear

