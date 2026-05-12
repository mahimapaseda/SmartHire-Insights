# SmartHire-Insights Runner Script
# Launches Frontend (React) and Backend (Python) from the workspace root.
# Run this script from the project root: .\start_site.ps1

$RootDir     = $PSScriptRoot
$FrontendDir = Join-Path $RootDir "frontend"
$BackendDir  = Join-Path $RootDir "backend"

Write-Host "--- Initializing SmartHire-Insights ---" -ForegroundColor Cyan
Write-Host "Root: $RootDir" -ForegroundColor DarkGray

# == 1. Frontend ==================================================
if (Test-Path $FrontendDir) {
    Write-Host "`n[1/2] Starting Frontend (React)..." -ForegroundColor Yellow

    if (-not (Test-Path (Join-Path $FrontendDir "node_modules"))) {
        Write-Host "  node_modules not found. Installing dependencies..." -ForegroundColor Gray
        & npm install --prefix $FrontendDir
    }

    Start-Process powershell -ArgumentList `
        "-NoExit", "-Command", "npm run dev --prefix `"$FrontendDir`" -- --host"

    Write-Host "  Frontend starting at http://localhost:5173" -ForegroundColor Cyan
} else {
    Write-Warning "Frontend directory not found at: $FrontendDir"
}

# == 2. Backend ===================================================
if ((Test-Path $BackendDir) -and (Get-ChildItem $BackendDir)) {
    Write-Host "`n[2/2] Starting Backend (Python)..." -ForegroundColor Yellow

    $VenvActivate = Join-Path $BackendDir "venv\Scripts\Activate.ps1"
    $AppScript    = Join-Path $BackendDir "app.py"

    if (Test-Path $VenvActivate) {
        Write-Host "  Activating virtual environment..." -ForegroundColor Gray
        Start-Process powershell -ArgumentList `
            "-NoExit", "-Command", "cd `"$BackendDir`"; & `"$VenvActivate`"; python app.py"
    } else {
        Start-Process powershell -ArgumentList `
            "-NoExit", "-Command", "cd `"$BackendDir`"; python app.py"
    }

    Write-Host "  Backend starting at http://localhost:5000" -ForegroundColor Cyan
} else {
    Write-Host "`n[2/2] Backend not found or empty - skipping." -ForegroundColor Gray
    Write-Host "  Place Python code in: $BackendDir" -ForegroundColor DarkGray
}

Write-Host "`nDone. Check the new terminal windows for logs." -ForegroundColor Green
