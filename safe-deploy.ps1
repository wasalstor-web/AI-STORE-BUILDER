# safe-deploy.ps1 - Pre-deployment safety checks
# Run this BEFORE deploying to production
# Usage: .\safe-deploy.ps1

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AI Store Builder - Safe Deploy Check  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$passed = 0
$failed = 0
$warnings = 0

function Pass($msg) { 
    Write-Host "  [PASS] $msg" -ForegroundColor Green
    $script:passed++
}
function Fail($msg) { 
    Write-Host "  [FAIL] $msg" -ForegroundColor Red
    $script:failed++
}
function Warn($msg) { 
    Write-Host "  [WARN] $msg" -ForegroundColor Yellow
    $script:warnings++
}

# ---- CHECK 1: Git status ----
Write-Host "1. Git Status" -ForegroundColor White
$gitStatus = git -C $projectRoot status --porcelain 2>$null
if ($gitStatus) {
    Warn "Uncommitted changes detected ($(@($gitStatus).Count) files)"
    Write-Host "     Run: git add -A && git commit -m 'your message'" -ForegroundColor DarkGray
} else {
    Pass "Working directory is clean"
}

# ---- CHECK 2: Current branch ----
Write-Host "2. Branch Check" -ForegroundColor White
$branch = git -C $projectRoot branch --show-current 2>$null
if ($branch -eq "main") {
    Warn "You are on 'main' branch - consider using a feature branch"
} else {
    Pass "On branch: $branch (not main)"
}

# ---- CHECK 3: Frontend build ----
Write-Host "3. Frontend Build" -ForegroundColor White
$frontendDir = Join-Path $projectRoot "frontend"
if (Test-Path $frontendDir) {
    $nodeModules = Join-Path $frontendDir "node_modules"
    if (-not (Test-Path $nodeModules)) {
        Write-Host "     Installing dependencies..." -ForegroundColor DarkGray
        Push-Location $frontendDir
        npm install 2>$null | Out-Null
        Pop-Location
    }
    
    Push-Location $frontendDir
    $buildOutput = npx vite build 2>&1
    $buildExitCode = $LASTEXITCODE
    Pop-Location
    
    if ($buildExitCode -eq 0) {
        # Check for error count in output
        $errorLine = $buildOutput | Select-String "error" | Select-Object -First 1
        if ($errorLine -and $errorLine -notmatch "0 error") {
            Fail "Frontend build has errors"
            Write-Host "     $errorLine" -ForegroundColor DarkGray
        } else {
            Pass "Frontend builds successfully (0 errors)"
        }
    } else {
        Fail "Frontend build failed!"
        $buildOutput | Select-String "error" | ForEach-Object { Write-Host "     $_" -ForegroundColor DarkGray }
    }
} else {
    Fail "Frontend directory not found"
}

# ---- CHECK 4: Backend imports ----
Write-Host "4. Backend Imports" -ForegroundColor White
Push-Location $projectRoot
$importCheck = python -c "
try:
    import app.main
    import app.config
    import app.database
    print('OK')
except Exception as e:
    print(f'FAIL: {e}')
" 2>&1
Pop-Location

if ($importCheck -match "^OK") {
    Pass "Backend modules import successfully"
} else {
    Fail "Backend import error: $importCheck"
}

# ---- CHECK 5: .env file ----
Write-Host "5. Environment Config" -ForegroundColor White
$envFile = Join-Path $projectRoot ".env"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw -Encoding UTF8
    
    # Check for required vars
    $requiredVars = @("SECRET_KEY", "DATABASE_URL")
    $missingVars = @()
    foreach ($var in $requiredVars) {
        if ($envContent -notmatch "$var\s*=") {
            $missingVars += $var
        }
    }
    
    if ($missingVars.Count -gt 0) {
        Fail "Missing env vars: $($missingVars -join ', ')"
    } else {
        Pass ".env has required variables"
    }
    
    # Check for Arabic chars (known to cause Windows crash)
    if ($envContent -match '[\u0600-\u06FF]') {
        Fail ".env contains Arabic characters (causes Windows encoding crash!)"
    } else {
        Pass ".env has no Arabic characters"
    }
} else {
    Warn ".env file not found"
}

# ---- CHECK 6: Key files exist ----
Write-Host "6. Critical Files" -ForegroundColor White
$criticalFiles = @(
    "app/main.py",
    "app/config.py",
    "app/database.py",
    "app/api/ai_chat.py",
    "frontend/src/App.tsx",
    "frontend/src/pages/AIBuilderOptimized.tsx",
    "frontend/src/lib/api.ts",
    "frontend/vite.config.ts",
    "requirements.txt",
    "frontend/package.json"
)
$missingFiles = @()
foreach ($f in $criticalFiles) {
    $fullPath = Join-Path $projectRoot $f
    if (-not (Test-Path $fullPath)) {
        $missingFiles += $f
    }
}
if ($missingFiles.Count -gt 0) {
    Fail "Missing critical files: $($missingFiles -join ', ')"
} else {
    Pass "All $($criticalFiles.Count) critical files present"
}

# ---- CHECK 7: TypeScript strict errors ----
Write-Host "7. TypeScript Check" -ForegroundColor White
$tsconfigApp = Join-Path $frontendDir "tsconfig.app.json"
if (Test-Path $tsconfigApp) {
    Push-Location $frontendDir
    $tscOutput = npx tsc --noEmit 2>&1
    $tscExit = $LASTEXITCODE
    Pop-Location
    
    if ($tscExit -eq 0) {
        Pass "TypeScript: no type errors"
    } else {
        $errorCount = ($tscOutput | Select-String "error TS").Count
        if ($errorCount -gt 0) {
            Warn "TypeScript: $errorCount type errors (non-blocking)"
            $tscOutput | Select-String "error TS" | Select-Object -First 3 | ForEach-Object { 
                Write-Host "     $_" -ForegroundColor DarkGray 
            }
        } else {
            Pass "TypeScript check completed"
        }
    }
} else {
    Warn "tsconfig.app.json not found"
}

# ---- SUMMARY ----
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RESULTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Passed:   $passed" -ForegroundColor Green
Write-Host "  Warnings: $warnings" -ForegroundColor Yellow
Write-Host "  Failed:   $failed" -ForegroundColor Red
Write-Host ""

if ($failed -gt 0) {
    Write-Host "  DEPLOY BLOCKED - Fix failures before deploying!" -ForegroundColor Red
    Write-Host ""
    exit 1
} elseif ($warnings -gt 0) {
    Write-Host "  DEPLOY OK (with warnings) - Review warnings above" -ForegroundColor Yellow
    Write-Host ""
    exit 0
} else {
    Write-Host "  ALL CLEAR - Safe to deploy!" -ForegroundColor Green
    Write-Host ""
    exit 0
}
