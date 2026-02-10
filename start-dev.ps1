# PowerShell script to test and start AI Store Builder
Write-Host "🚀 AI Store Builder - Local Development Setup" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Yellow

# Set location to script directory
Set-Location $PSScriptRoot

# Test Python
Write-Host "`n🐍 Testing Python..." -ForegroundColor Cyan
try {
    $pythonVersion = & python --version 2>&1
    Write-Host "✅ Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found: $_" -ForegroundColor Red
    exit 1
}

# Test imports
Write-Host "`n📦 Testing Backend Imports..." -ForegroundColor Cyan
try {
    $configTest = & python -c "from app.config import get_settings; s = get_settings(); print('Environment:', s.APP_ENV); print('Database:', s.DATABASE_URL); print('Host:', s.HOST + ':' + str(s.PORT))" 2>&1
    Write-Host "✅ Config loaded successfully" -ForegroundColor Green
    Write-Host $configTest -ForegroundColor Gray
} catch {
    Write-Host "❌ Import failed: $_" -ForegroundColor Red
}

# Health check
Write-Host "`n🏥 Running Health Check..." -ForegroundColor Cyan
try {
    & python health_check.py
} catch {
    Write-Host "❌ Health check failed: $_" -ForegroundColor Red
}

# Offer to start backend
Write-Host "`n🌟 Would you like to start the backend server? (Y/N)" -ForegroundColor Yellow
$response = Read-Host

if ($response -eq "Y" -or $response -eq "y") {
    Write-Host "`n🚀 Starting Backend Server..." -ForegroundColor Green
    Write-Host "📍 Server will be available at: http://127.0.0.1:8000" -ForegroundColor Cyan
    Write-Host "📖 API Documentation: http://127.0.0.1:8000/docs" -ForegroundColor Cyan
    Write-Host "🛑 Press Ctrl+C to stop the server" -ForegroundColor Yellow
    Write-Host ""
    
    try {
        & python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload --log-level info
    } catch {
        Write-Host "❌ Server failed to start: $_" -ForegroundColor Red
    }
}

Write-Host "`n✨ Done!" -ForegroundColor Green