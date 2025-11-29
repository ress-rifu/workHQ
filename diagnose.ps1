Write-Host "Checking WorkHQ Backend..." -ForegroundColor Cyan

$backendUrl = "https://workhq-api.vercel.app"

Write-Host "`nTesting backend health endpoint..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$backendUrl/health" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "SUCCESS: Backend is reachable!" -ForegroundColor Green
    Write-Host "Status: $($response.status)" -ForegroundColor Green
    Write-Host "Database: $($response.database)" -ForegroundColor Green
    Write-Host "`nYour backend is working! You can build the APK now." -ForegroundColor Green
}
catch {
    Write-Host "FAILED: Backend is NOT reachable!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nSOLUTION: Deploy your backend to Vercel" -ForegroundColor Yellow
    Write-Host "See BACKEND_DEPLOYMENT_FIX.md for instructions" -ForegroundColor Yellow
}
