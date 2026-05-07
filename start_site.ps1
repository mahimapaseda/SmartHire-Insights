# SmartHire-Insights Runner Script
# This script initializes and runs both the Frontend (React) and Backend (Python)

Write-Host "--- Initializing SmartHire-Insights ---" -ForegroundColor Cyan

# 1. Frontend Setup & Run
$FrontendDir = Join-Path $PSScriptRoot "frontend"
if (Test-Path $FrontendDir) {
    Write-Host "`n[1/2] Starting Frontend (React)..." -ForegroundColor Yellow
    Set-Location $FrontendDir
    
    if (-not (Test-Path "node_modules")) {
        Write-Host "node_modules not found. Installing dependencies..." -ForegroundColor Gray
        npm install
    }
    
    # Run frontend in a new background job or window
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev -- --host"
} else {
    Write-Warning "Frontend directory not found!"
}

# 2. Backend Setup & Run (Future-proofing for Anuruddha)
$BackendDir = Join-Path $PSScriptRoot "backend"
Set-Location $PSScriptRoot

if (Test-Path $BackendDir) {
    Write-Host "`n[2/2] Starting Backend (Python 3.11.9)..." -ForegroundColor Yellow
    Set-Location $BackendDir
    
    # Assuming Anuruddha uses a virtual environment or direct python call
    if (Test-Path "venv") {
        Write-Host "Activating virtual environment..." -ForegroundColor Gray
        Start-Process powershell -ArgumentList "-NoExit", "-Command", ".\venv\Scripts\Activate.ps1; python app.py"
    } else {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "python app.py"
    }
} else {
    Write-Host "`n[2/2] Backend directory not found. Skipping backend start." -ForegroundColor Gray
    Write-Host "Note: Anuruddha should place Python code in a 'backend' folder." -ForegroundColor Gray
}

Write-Host "`nSite is being launched! Check the new windows for logs." -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
