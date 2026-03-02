param()

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "SINCRONIZACION DE VARIABLES VERCEL" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# Leer .env
Write-Host "Leyendo archivo .env..." -ForegroundColor Yellow
# Lee TODAS las variables (VITE_ y server-only) excluyendo comentarios y líneas vacías
$envLines = Get-Content ".env" | Where-Object { $_ -match "^[A-Z_]" -and $_ -notmatch "^\s*#" -and $_ -match "=" }
$envDict = @{}

foreach ($line in $envLines) {
    if ($line -match "^([^=]+)=(.*)$") {
        $key = $matches[1].Trim()
        $val = $matches[2].Trim() -replace '^"' -replace '"$'
        $envDict[$key] = $val
    }
}

$viteCount = ($envDict.Keys | Where-Object { $_ -match "^VITE_" }).Count
$serverCount = $envDict.Count - $viteCount
Write-Host "OK: Se encontraron $($envDict.Count) variables ($viteCount VITE_ + $serverCount server-only)" -ForegroundColor Green
Write-Host ""

# Variables de contratos a sincronizar
$contractVars = @(
    "FIREBASE_SERVICE_ACCOUNT",
    "FIREBASE_PROJECT_ID",
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_AUTH_DOMAIN",
    "VITE_FIREBASE_PROJECT_ID",
    "VITE_FIREBASE_STORAGE_BUCKET",
    "VITE_FIREBASE_MESSAGING_SENDER_ID",
    "VITE_FIREBASE_APP_ID",
    "VITE_FIREBASE_MEASUREMENT_ID",
    "VITE_ENHANCED_SMARTSTAKING_ADDRESS",
    "VITE_STAKING_CORE_ADDRESS",
    "VITE_ENHANCED_SMARTSTAKING_REWARDS_ADDRESS",
    "VITE_STAKING_REWARDS_ADDRESS",
    "VITE_ENHANCED_SMARTSTAKING_SKILLS_ADDRESS",
    "VITE_STAKING_SKILLS_ADDRESS",
    "VITE_ENHANCED_SMARTSTAKING_GAMIFICATION_ADDRESS",
    "VITE_STAKING_GAMIFICATION_ADDRESS",
    "VITE_ENHANCED_SMARTSTAKING_VIEWER_ADDRESS",
    "VITE_STAKING_VIEW_CORE_ADDRESS",
    "VITE_ENHANCED_SMARTSTAKING_VIEWSTATS_ADDRESS",
    "VITE_STAKING_VIEW_STATS_ADDRESS",
    "VITE_ENHANCED_SMARTSTAKING_VIEWSKILLS_ADDRESS",
    "VITE_STAKING_VIEW_SKILLS_ADDRESS",
    "VITE_STAKING_VIEW_ADDRESS",
    "VITE_DYNAMIC_APY_CALCULATOR_ADDRESS",
    "VITE_GAMEIFIED_MARKETPLACE_PROXY",
    "VITE_MARKETPLACE_PROXY_ADDRESS",
    "VITE_LEVELING_SYSTEM",
    "VITE_MARKETPLACE_LEVELING_ADDRESS",
    "VITE_REFERRAL_SYSTEM",
    "VITE_MARKETPLACE_REFERRAL_ADDRESS",
    "VITE_GAMEIFIED_MARKETPLACE_SKILLS",
    "VITE_MARKETPLACE_SKILLS_NFT_ADDRESS",
    "VITE_INDIVIDUAL_SKILLS",
    "VITE_MARKETPLACE_INDIVIDUAL_SKILLS_ADDRESS",
    "VITE_GAMEIFIED_MARKETPLACE_QUESTS",
    "VITE_MARKETPLACE_QUESTS_ADDRESS",
    "VITE_COLLABORATOR_BADGE_REWARDS_ADDRESS",
    "VITE_MARKETPLACE_COLLABORATOR_BADGES_ADDRESS",
    "VITE_MARKETPLACE_VIEW",
    "VITE_MARKETPLACE_VIEW_ADDRESS",
    "VITE_MARKETPLACE_STATISTICS",
    "VITE_MARKETPLACE_STATISTICS_ADDRESS",
    "VITE_MARKETPLACE_SOCIAL",
    "VITE_MARKETPLACE_SOCIAL_ADDRESS",
    "VITE_TREASURY_MANAGER_ADDRESS",
    "VITE_ALCHEMY",
    "VITE_WALLETCONNECT_PROJECT_ID"
)

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "FASE 1: AGREGANDO VARIABLES FALTANTES A VERCEL" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

$added = 0
$skipped = 0

foreach ($varName in $contractVars) {
    if ($envDict.ContainsKey($varName)) {
        $value = $envDict[$varName]
        
        Write-Host "Agregando: $varName" -ForegroundColor Cyan
        
        # Remove existing var first (to overwrite BOM-corrupted values)
        & npx vercel env rm $varName production --yes 2>&1 | Out-Null
        
        # Write value as UTF-8 WITHOUT BOM (critical: Set-Content defaults to UTF-16 LE on PS5)
        $tempFile = [System.IO.Path]::GetTempFileName()
        [System.IO.File]::WriteAllText($tempFile, $value, [System.Text.UTF8Encoding]::new($false))
        
        $output = & cmd /c "type `"$tempFile`" | npx vercel env add $varName production --non-interactive 2>&1"
        
        Remove-Item -Path $tempFile -Force
        
        if ($LASTEXITCODE -eq 0 -or $output -like "*added*" -or $output -like "*already*") {
            Write-Host "  OK: Sincronizada" -ForegroundColor Green
            $added++
        } else {
            Write-Host "  ERROR: $output" -ForegroundColor Red
        }
    } else {
        Write-Host "  OMITIDA: No encontrada en .env" -ForegroundColor Yellow
        $skipped++
    }
}

Write-Host ""
Write-Host "Resultado Fase 1: $added agregadas, $skipped omitidas" -ForegroundColor Green
Write-Host ""

# Esperar un momento para que Vercel actualice
Write-Host "Esperando a que Vercel sincronice..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "FASE 2: VALIDANDO VARIABLES EN VERCEL" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Validando variables en Vercel..." -ForegroundColor Yellow
$validated = 0
$missing = @()

foreach ($varName in $contractVars) {
    $testOutput = npx vercel env list production 2>&1 | Select-String $varName
    
    if ($testOutput) {
        Write-Host "  OK: $varName" -ForegroundColor Green
        $validated++
    } else {
        Write-Host "  FALTA: $varName" -ForegroundColor Red
        $missing += $varName
    }
}

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "RESULTADO FINAL" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "Variables validadas: $validated/$($contractVars.Count)" -ForegroundColor Green

if ($missing.Count -gt 0) {
    Write-Host "Variables faltantes: $($missing.Count)" -ForegroundColor Red
    Write-Host ""
    foreach ($var in $missing) {
        Write-Host "  - $var" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "ESTADO: INCOMPLETO" -ForegroundColor Red
} else {
    Write-Host ""
    Write-Host "ESTADO: TODAS LAS VARIABLES SINCRONIZADAS CORRECTAMENTE" -ForegroundColor Green
}

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""
