param()

Write-Host "Starting Lighthouse CI Audit..." -ForegroundColor Cyan

Write-Host "Building project..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed" -ForegroundColor Red
    exit 1
}

Write-Host "Starting preview server..." -ForegroundColor Yellow
# FIX: Use cmd.exe to run npm on Windows
$previewProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm run preview" -NoNewWindow -PassThru -RedirectStandardError "$env:TEMP\vite-preview-errors.txt"

Write-Host "Waiting for server..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

Write-Host "Checking connectivity..." -ForegroundColor Yellow
$maxRetries = 10
$serverReady = $false

for ($i = 0; $i -lt $maxRetries; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:4173/" -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "Server is ready!" -ForegroundColor Green
            $serverReady = $true
            break
        }
    }
    catch {
        Write-Host "Retry $($i+1)/$maxRetries..." -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
}

if ($serverReady -eq $false) {
    Write-Host "Server failed to respond" -ForegroundColor Red
    # FIX: Add null check before stopping process
    if ($null -ne $previewProcess) {
        Stop-Process -Id $previewProcess.Id -Force -ErrorAction SilentlyContinue
    }
    exit 1
}

Write-Host "Running Lighthouse CI..." -ForegroundColor Cyan

# Set Edge path as environment variable for LHCI
$edgePath = "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edgePath)) {
    $edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
}

$env:CHROME_PATH = $edgePath

# Suppress non-critical warnings
$env:LHCI_SUPPRESS_WARNINGS = "true"

# Run Lighthouse CI
lhci autorun --config=./lighthouserc.cjs 2>&1 | Where-Object { $_ -notmatch "http proxy error|GitHub token not set" }

Write-Host "Stopping server..." -ForegroundColor Yellow
# FIX: Add null check before stopping process
if ($null -ne $previewProcess) {
    Stop-Process -Id $previewProcess.Id -Force -ErrorAction SilentlyContinue
}

Write-Host "Audit completed!" -ForegroundColor Green

$reports = Get-ChildItem -Path ".\.lighthouseci\lhr-*.html" -ErrorAction SilentlyContinue

if ($reports) {
    Write-Host "Reports available:" -ForegroundColor Yellow
    foreach ($report in $reports) {
        Write-Host "  - $($report.Name)" -ForegroundColor Green
    }
    Write-Host ""
    Write-Host "Opening latest report in Edge..." -ForegroundColor Cyan
    $latestReport = $reports | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    Start-Process -FilePath "msedge.exe" -ArgumentList $latestReport.FullName
}
else {
    Write-Host "No reports found in .lighthouseci/" -ForegroundColor Red
}