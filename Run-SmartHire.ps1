# =========================================================
# SmartHire Insights - Single Run Script
# =========================================================

$RootDir    = $PSScriptRoot
$BackendDir = Join-Path $RootDir "backend"
$VenvDir    = Join-Path $BackendDir "venv"
$ReqFile    = Join-Path $BackendDir "requirements.txt"
$FrontendDir = Join-Path $RootDir "frontend"

Write-Host "--- Initializing SmartHire Insights ---" -ForegroundColor Cyan
Write-Host "Root: $RootDir" -ForegroundColor DarkGray

# == 1. Start Neo4j Database ======================================
Write-Host "`n[1/3] Checking Neo4j Database..." -ForegroundColor Yellow

# Attempt to start Desktop app if not running
$Neo4jRunning = Get-Process "Neo4j Desktop" -ErrorAction SilentlyContinue
if (-not $Neo4jRunning) {
    Write-Host "  Neo4j Desktop is not running. Attempting to start..." -ForegroundColor Gray
    $Neo4jPaths = @(
        "$env:LOCALAPPDATA\Programs\Neo4j Desktop\Neo4j Desktop.exe",
        "C:\Program Files\Neo4j Desktop\Neo4j Desktop.exe"
    )
    foreach ($Path in $Neo4jPaths) {
        if (Test-Path $Path) {
            Start-Process $Path
            break
        }
    }
}

# Now, wait for the actual Database port (Bolt) to be active
Write-Host "  Waiting for Neo4j Database port (7687) to become active..." -ForegroundColor Cyan
Write-Host "  (IMPORTANT: You must manually CLICK 'START' on your database in Neo4j Desktop)" -ForegroundColor DarkCyan

$maxWait = 60
$spent = 0
while ($spent -lt $maxWait) {
    $portCheck = Get-NetTCPConnection -LocalPort 7687 -ErrorAction SilentlyContinue
    if ($portCheck) {
        Write-Host "`n  Neo4j Database is online and ready!" -ForegroundColor Green
        break
    }
    Write-Host "." -NoNewline
    Start-Sleep -Seconds 3
    $spent += 3
}

if (-not (Get-NetTCPConnection -LocalPort 7687 -ErrorAction SilentlyContinue)) {
    Write-Warning "`n  Timed out waiting for Neo4j (7687). Please ensure your database is running."
}


# == 2. Backend Setup & Run =======================================
if (Test-Path $BackendDir) {
    Write-Host "`n[2/3] Processing Backend (Python)..." -ForegroundColor Yellow

    # Setup Virtual Environment
    if (-Not (Test-Path $VenvDir)) {
        Write-Host "  Creating virtual environment..." -ForegroundColor Gray
        python -m venv $VenvDir
    }
    
    $PipExe = Join-Path $VenvDir "Scripts\pip.exe"
    $PythonExe = Join-Path $VenvDir "Scripts\python.exe"

    # Install Requirements
    if (Test-Path $ReqFile) {
        Write-Host "  Checking/Installing dependencies from requirements.txt..." -ForegroundColor Gray
        & $PipExe install -r $ReqFile -q
    }

    # Download spaCy model if missing
    Write-Host "  Ensuring spaCy en_core_web_sm model is installed..." -ForegroundColor Gray
    $spacyModelCheck = & $PythonExe -c "import spacy; spacy.util.get_package_path('en_core_web_sm')" 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  Downloading spaCy en_core_web_sm model..." -ForegroundColor Gray
        & $PythonExe -m spacy download en_core_web_sm
    }

    Write-Host "  Ensuring NLTK corpora are installed..." -ForegroundColor Gray
    & $PythonExe -c "import nltk; [nltk.download(p, quiet=True) for p in ('punkt','punkt_tab','stopwords','wordnet','averaged_perceptron_tagger','averaged_perceptron_tagger_eng')]"

    # Start Backend Server
    $VenvActivate = Join-Path $VenvDir "Scripts\Activate.ps1"
    if (Test-Path $VenvActivate) {
        Write-Host "  Starting Backend Server at http://localhost:5000" -ForegroundColor Cyan
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$BackendDir`"; & `"$VenvActivate`"; python app.py"
    } else {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$BackendDir`"; python app.py"
    }
} else {
    Write-Warning "Backend directory not found at: $BackendDir"
}

# == 3. Frontend Setup & Run ======================================
if (Test-Path $FrontendDir) {
    Write-Host "`n[3/3] Processing Frontend (React)..." -ForegroundColor Yellow

    # Setup node_modules
    if (-not (Test-Path (Join-Path $FrontendDir "node_modules"))) {
        Write-Host "  node_modules not found. Installing dependencies..." -ForegroundColor Gray
        & npm install --prefix $FrontendDir
    }

    # Start Frontend Server
    Write-Host "  Starting Frontend Server at http://localhost:5173" -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev --prefix `"$FrontendDir`" -- --host"
} else {
    Write-Warning "Frontend directory not found at: $FrontendDir"
}

Write-Host "`nDone. Check the new terminal windows for the application logs." -ForegroundColor Green
