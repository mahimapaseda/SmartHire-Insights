# =========================================================
# SmartHire Insights - Backend Setup Script
# =========================================================

$RootDir    = $PSScriptRoot
$BackendDir = Join-Path $RootDir "backend"
$VenvDir    = Join-Path $BackendDir "venv"
$ReqFile    = Join-Path $BackendDir "requirements.txt"

Write-Host "--- Initializing Backend Setup ---" -ForegroundColor Cyan

# 1. Create Virtual Environment
if (-Not (Test-Path $VenvDir)) {
    Write-Host "`n[1/3] Creating virtual environment..." -ForegroundColor Yellow
    python -m venv $VenvDir
    Write-Host "  Done." -ForegroundColor Green
} else {
    Write-Host "`n[1/3] Virtual environment already exists." -ForegroundColor Gray
}

# 2. Install Python Dependencies
$PipExe = Join-Path $VenvDir "Scripts\pip.exe"
if (Test-Path $ReqFile) {
    Write-Host "`n[2/3] Installing dependencies from requirements.txt..." -ForegroundColor Yellow
    & $PipExe install -r $ReqFile
    Write-Host "  Done." -ForegroundColor Green
} else {
    Write-Host "`n[2/3] Error: requirements.txt not found in backend directory!" -ForegroundColor Red
}

# 3. Download spaCy Model
$PythonExe = Join-Path $VenvDir "Scripts\python.exe"
Write-Host "`n[3/3] Downloading spaCy en_core_web_sm model..." -ForegroundColor Yellow
& $PythonExe -m spacy download en_core_web_sm
Write-Host "  Done." -ForegroundColor Green

Write-Host "`nBackend setup completed successfully!" -ForegroundColor Cyan
