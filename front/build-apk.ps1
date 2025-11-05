# WorkHQ APK Build Script

Write-Host "`n╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     📱 WorkHQ APK Build Assistant 📱      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Check if EAS CLI is installed
Write-Host "Checking EAS CLI..." -ForegroundColor Yellow
try {
    $easVersion = eas --version
    Write-Host "✅ EAS CLI installed: $easVersion`n" -ForegroundColor Green
} catch {
    Write-Host "❌ EAS CLI not found. Installing...`n" -ForegroundColor Red
    npm install -g eas-cli
}

# Check if logged in
Write-Host "Checking Expo login status..." -ForegroundColor Yellow
$loginStatus = eas whoami 2>&1

if ($loginStatus -match "Not logged in") {
    Write-Host "❌ Not logged in to Expo`n" -ForegroundColor Red
    Write-Host "Please login to Expo:" -ForegroundColor Cyan
    Write-Host "  eas login`n" -ForegroundColor White
    
    $shouldLogin = Read-Host "Login now? (y/n)"
    if ($shouldLogin -eq "y") {
        eas login
    } else {
        Write-Host "`nPlease run 'eas login' first, then run this script again.`n" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "✅ Logged in as: $loginStatus`n" -ForegroundColor Green
}

# Build options
Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║            Select Build Type              ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "1. Preview Build (For testing - faster)" -ForegroundColor White
Write-Host "   - Quick build for internal testing" -ForegroundColor Gray
Write-Host "   - Can install directly on device" -ForegroundColor Gray
Write-Host "   - ~50-80 MB APK size`n" -ForegroundColor Gray

Write-Host "2. Production Build (For Play Store)" -ForegroundColor White
Write-Host "   - Optimized for release" -ForegroundColor Gray
Write-Host "   - Signed with your keystore" -ForegroundColor Gray
Write-Host "   - Ready for Google Play Store`n" -ForegroundColor Gray

$choice = Read-Host "Select build type (1 or 2)"

switch ($choice) {
    "1" {
        Write-Host "`n🚀 Starting Preview Build...`n" -ForegroundColor Cyan
        Write-Host "This will take approximately 10-20 minutes.`n" -ForegroundColor Yellow
        Write-Host "You can monitor progress at: https://expo.dev`n" -ForegroundColor Gray
        
        eas build --platform android --profile preview
    }
    "2" {
        Write-Host "`n🚀 Starting Production Build...`n" -ForegroundColor Cyan
        Write-Host "This will take approximately 15-25 minutes.`n" -ForegroundColor Yellow
        Write-Host "You can monitor progress at: https://expo.dev`n" -ForegroundColor Gray
        
        eas build --platform android --profile production
    }
    default {
        Write-Host "`n❌ Invalid choice. Please run the script again.`n" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n✅ Build started successfully!`n" -ForegroundColor Green
Write-Host "📊 You can:" -ForegroundColor Cyan
Write-Host "   • Monitor build progress in terminal" -ForegroundColor Gray
Write-Host "   • Check status at: https://expo.dev" -ForegroundColor Gray
Write-Host "   • Once complete, you'll get a download link`n" -ForegroundColor Gray

Write-Host "💡 Tip: The APK download link will be valid for 30 days`n" -ForegroundColor Yellow

