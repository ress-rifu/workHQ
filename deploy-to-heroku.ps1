# WorkHQ - Heroku Deployment Script
# This script helps you deploy the backend to Heroku

Write-Host "`n🚀 WorkHQ Heroku Deployment Wizard" -ForegroundColor Cyan
Write-Host "===================================`n" -ForegroundColor Cyan

# Check if Heroku CLI is installed
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
try {
    $herokuVersion = heroku --version
    Write-Host "✅ Heroku CLI installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Heroku CLI is not installed" -ForegroundColor Red
    Write-Host "`nPlease install Heroku CLI from:" -ForegroundColor Yellow
    Write-Host "https://devcenter.heroku.com/articles/heroku-cli`n" -ForegroundColor White
    exit 1
}

# Check if logged in to Heroku
Write-Host "`nChecking Heroku login status..." -ForegroundColor Yellow
try {
    $herokuAuth = heroku auth:whoami 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Logged in to Heroku as: $herokuAuth" -ForegroundColor Green
    } else {
        Write-Host "❌ Not logged in to Heroku" -ForegroundColor Red
        Write-Host "`nPlease login first:" -ForegroundColor Yellow
        Write-Host "  heroku login`n" -ForegroundColor White
        exit 1
    }
} catch {
    Write-Host "❌ Not logged in to Heroku" -ForegroundColor Red
    Write-Host "`nPlease login first:" -ForegroundColor Yellow
    Write-Host "  heroku login`n" -ForegroundColor White
    exit 1
}

Write-Host "`n📝 Deployment Options:`n" -ForegroundColor Cyan
Write-Host "1. Create new Heroku app and deploy" -ForegroundColor White
Write-Host "2. Deploy to existing Heroku app" -ForegroundColor White
Write-Host "3. Set environment variables only" -ForegroundColor White
Write-Host "4. Exit`n" -ForegroundColor White

$choice = Read-Host "Select option (1-4)"

switch ($choice) {
    "1" {
        Write-Host "`n📦 Creating new Heroku app..." -ForegroundColor Yellow
        $appName = Read-Host "Enter app name (e.g., workhq-api)"
        
        Write-Host "Creating Heroku app: $appName" -ForegroundColor Gray
        heroku create $appName
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Heroku app created!" -ForegroundColor Green
            
            Write-Host "`n🔧 Now you need to set environment variables" -ForegroundColor Yellow
            Write-Host "Run this script again and select option 3" -ForegroundColor Gray
            Write-Host "`nOr manually set them:" -ForegroundColor Yellow
            Write-Host "  heroku config:set DATABASE_URL='...' -a $appName" -ForegroundColor Gray
            Write-Host "  heroku config:set SUPABASE_URL='...' -a $appName" -ForegroundColor Gray
            Write-Host "  etc." -ForegroundColor Gray
        }
    }
    
    "2" {
        Write-Host "`n🚀 Deploying to Heroku..." -ForegroundColor Yellow
        $appName = Read-Host "Enter your Heroku app name"
        
        Write-Host "`nAdding Heroku remote..." -ForegroundColor Gray
        heroku git:remote -a $appName
        
        Write-Host "`nDeploying backend to Heroku..." -ForegroundColor Yellow
        Write-Host "This will push the Back/ folder to Heroku..." -ForegroundColor Gray
        
        Set-Location -Path "E:\Playground\WorkHQ"
        git subtree push --prefix Back heroku master
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n✅ Deployment successful!" -ForegroundColor Green
            Write-Host "`n📊 Your API is now running at:" -ForegroundColor Cyan
            Write-Host "  https://$appName.herokuapp.com`n" -ForegroundColor White
            
            Write-Host "🔍 To check logs:" -ForegroundColor Yellow
            Write-Host "  heroku logs --tail -a $appName`n" -ForegroundColor Gray
            
            Write-Host "🌐 To open in browser:" -ForegroundColor Yellow
            Write-Host "  heroku open -a $appName`n" -ForegroundColor Gray
        } else {
            Write-Host "`n❌ Deployment failed. Check errors above." -ForegroundColor Red
        }
    }
    
    "3" {
        Write-Host "`n🔧 Setting Environment Variables..." -ForegroundColor Yellow
        $appName = Read-Host "Enter your Heroku app name"
        
        Write-Host "`nPlease provide your environment variables:" -ForegroundColor Cyan
        Write-Host "(Get these from your Back/.env file or Supabase Dashboard)`n" -ForegroundColor Gray
        
        $databaseUrl = Read-Host "DATABASE_URL"
        $supabaseUrl = Read-Host "SUPABASE_URL"
        $supabaseAnonKey = Read-Host "SUPABASE_ANON_KEY"
        $supabaseServiceKey = Read-Host "SUPABASE_SERVICE_ROLE_KEY"
        $jwtSecret = Read-Host "JWT_SECRET (for production)"
        
        Write-Host "`nSetting variables on Heroku..." -ForegroundColor Yellow
        
        heroku config:set DATABASE_URL="$databaseUrl" -a $appName
        heroku config:set SUPABASE_URL="$supabaseUrl" -a $appName
        heroku config:set SUPABASE_ANON_KEY="$supabaseAnonKey" -a $appName
        heroku config:set SUPABASE_SERVICE_ROLE_KEY="$supabaseServiceKey" -a $appName
        heroku config:set JWT_SECRET="$jwtSecret" -a $appName
        heroku config:set NODE_ENV=production -a $appName
        
        Write-Host "`n✅ Environment variables set!" -ForegroundColor Green
        Write-Host "`n📋 Current config:" -ForegroundColor Yellow
        heroku config -a $appName
    }
    
    "4" {
        Write-Host "`nExiting...`n" -ForegroundColor Yellow
        exit 0
    }
    
    default {
        Write-Host "`n❌ Invalid option. Please select 1-4.`n" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n✨ Done!`n" -ForegroundColor Green

