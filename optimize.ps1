Write-Host "🧹 Cleaning cache and optimizing..." -ForegroundColor Yellow

# Clear Laravel cache
Write-Host "`n📦 Clearing Laravel cache..." -ForegroundColor Cyan
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan optimize:clear

# Clear Vite cache
Write-Host "`n🗑️ Clearing Vite cache..." -ForegroundColor Cyan
if (Test-Path "node_modules\.vite") {
    Remove-Item -Recurse -Force "node_modules\.vite"
    Write-Host "  ✓ Removed node_modules\.vite" -ForegroundColor Green
}
if (Test-Path "public\build") {
    Remove-Item -Recurse -Force "public\build"
    Write-Host "  ✓ Removed public\build" -ForegroundColor Green
}

# Optimize Laravel
Write-Host "`n⚡ Optimizing Laravel..." -ForegroundColor Cyan
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

Write-Host "`n✅ Optimization complete!" -ForegroundColor Green
Write-Host "💡 Recommended next steps:" -ForegroundColor Yellow
Write-Host "  1. Restart PHP service: taskkill /F /IM php.exe" -ForegroundColor White
Write-Host "  2. Rebuild assets: npm run build" -ForegroundColor White
Write-Host "  3. Check RAM: Get-Process php,node,mysqld | Select-Object ProcessName,@{Name='RAM(MB)';Expression={[math]::Round(`$_.WS/1MB,2)}}" -ForegroundColor White
