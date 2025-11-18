# Quick script to set Vercel environment variables

Write-Host "🔧 Setting up Vercel Environment Variables..." -ForegroundColor Cyan
Write-Host ""

cd Back

Write-Host "Setting DATABASE_URL..." -ForegroundColor Yellow
$env:VERCEL_ENV_VALUE = "postgresql://postgres:zptVbRfX0oAunTQj@db.rdkgfezrowfnlrbtiekn.supabase.co:5432/postgres?pgbouncer=true"
echo $env:VERCEL_ENV_VALUE | vercel env add DATABASE_URL production

Write-Host "Setting SUPABASE_URL..." -ForegroundColor Yellow
$env:VERCEL_ENV_VALUE = "https://rdkgfezrowfnlrbtiekn.supabase.co"
echo $env:VERCEL_ENV_VALUE | vercel env add SUPABASE_URL production

Write-Host "Setting SUPABASE_ANON_KEY..." -ForegroundColor Yellow
$env:VERCEL_ENV_VALUE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJka2dmZXpyb3dmbmxyYnRpZWtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4OTUyNzEsImV4cCI6MjA3NzQ3MTI3MX0.UV_PmsUcpsrOmM5bn4Y8xrlFJCRvHX1dJOieykXwDIs"
echo $env:VERCEL_ENV_VALUE | vercel env add SUPABASE_ANON_KEY production

Write-Host "Setting SUPABASE_SERVICE_ROLE_KEY..." -ForegroundColor Yellow
$env:VERCEL_ENV_VALUE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJka2dmZXpyb3dmbmxyYnRpZWtuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTg5NTI3MSwiZXhwIjoyMDc3NDcxMjcxfQ.UEJ8QSiFsVrbwmVG3s4kl3asuurFkaFvGl8jjHVtBR4"
echo $env:VERCEL_ENV_VALUE | vercel env add SUPABASE_SERVICE_ROLE_KEY production

Write-Host "Setting JWT_SECRET..." -ForegroundColor Yellow
$env:VERCEL_ENV_VALUE = "local-dev-secret-change-in-production-12345"
echo $env:VERCEL_ENV_VALUE | vercel env add JWT_SECRET production

Write-Host "Setting NODE_ENV..." -ForegroundColor Yellow
$env:VERCEL_ENV_VALUE = "production"
echo $env:VERCEL_ENV_VALUE | vercel env add NODE_ENV production

Write-Host ""
Write-Host "✅ Environment variables set!" -ForegroundColor Green
Write-Host "Now redeploying..." -ForegroundColor Yellow
Write-Host ""

vercel --prod --yes

Write-Host ""
Write-Host "✅ Done! Test your backend:" -ForegroundColor Green
Write-Host "curl https://workhq-api.vercel.app/health" -ForegroundColor Cyan

